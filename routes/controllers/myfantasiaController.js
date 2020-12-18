const mecab = require('mecab-ya');
const puppeteer = require('puppeteer');

const User = require('../../models/User');
const OriginalDiary = require('../../models/OriginalDiary');
const FantasiaDiary = require('../../models/FantasiaDiary');

const { statusMessage } = require('../../constants/statusMessage');
const { sentimentAnalysis } = require('../../config/googleCNL');

exports.saveOriginalDiary = async function saveOriginalDiary(req, res, next) {
  const {
    data : originalDiaryData,
    fantasiaDiaryItem: fantasiaDiaryText
  } = req.body;  // 레퍼런스 111
  const { creator } = req.body.data;

  const newOriginalDiary = await OriginalDiary.create(originalDiaryData); // new Originaldiary 생성
  const { _id : newDiaryId } = newOriginalDiary;

  await User.findByIdAndUpdate(
    creator,
    { $addToSet: { original_diary_list: newDiaryId } }
  );

  // const fantasiaDiary = fantasiaDiaryText.details; // 일기 원문, 레퍼런스 222
  // 이 상태 그대로 db에 저장(객체상태) => frontend로 보내서 convertFromRow
  const { blocks } = fantasiaDiaryText; // 레퍼런스 333

  let index = 0;
  let jdex = 0;

  const diarySentences = blocks.map(item => item.text); // diary text 추출
  let divideSentenceIntoWord = diarySentences[index].split(' ');
  let anAndMotContainer = [];

  const wordsForCrawling = [];
  const changedWords = {};

  getAnalyzeWord();

  function getAnalyzeWord() {
    mecab.pos(divideSentenceIntoWord[jdex], (err, result) => {
      jdex++;

      classifyWordForCrawling(result, jdex);

      if (jdex === divideSentenceIntoWord.length) { // 일기 한줄에 대한 분석이 끝나면, 다른 줄로 넘어가는 것을 의미;
        jdex = 0;

        index++;

        if (index === diarySentences.length) {
          getDictionaryCrawling();

          return;
        }

        divideSentenceIntoWord = diarySentences[index].split(' ');

        getAnalyzeWord();

        return;
      }

      getAnalyzeWord();

      return;
    });
  }

  function classifyWordForCrawling(result, jdex) {
    console.log('result', result);
    const negativePhrase = ['안', '못'];
    const endingPhrase = ['EP', 'EC', 'EF', 'ETM', 'NNG', 'NNP'];
    const predicate = ['VV', 'VA', 'NNG', 'XR'];

    for (let i = 0; i < result.length; i++) {
      if (anAndMotContainer.length) {
        console.log('anAndMotContainer', anAndMotContainer);
        for (let k = 0; k < predicate.length; k++) {
          // anAndMotContainer에 안, 못이 있을경우
          // anAndMotContainer에 안, 못이 없을경우
          if (result[i][1].includes(predicate[k])) {
            changedWords[`${anAndMotContainer[0]} ${divideSentenceIntoWord[jdex - 1]}`] = divideSentenceIntoWord[jdex - 1];
            anAndMotContainer.length = 0;

            return;
          }
        }
      }

      for (let j = 0; j < negativePhrase.length; j++) {
        if (result[i][0] === negativePhrase[j]) {
          anAndMotContainer.push(negativePhrase[j]);

          return;
        }
      }

      for (let j = 0; j < endingPhrase.length; j++) {
        if (result[i][1].includes(endingPhrase[j])) {
          wordsForCrawling.push([divideSentenceIntoWord[jdex - 1], result[0][1]]);

          return;
        }
      }
    }
  }

  async function getDictionaryCrawling() {
    console.log('wordsForCrawling', wordsForCrawling); // wordsForCrawling => [ 단어, VV or VA ]
    // crawling => 문장 바꾸기

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });

    const page = await browser.newPage();

    for await (let word of wordsForCrawling) {
      console.log('word', word);
      let url = `https://ko.wiktionary.org/wiki/${word[0]}`;
      let selector = '#mw-content-text > div.mw-parser-output'; // 반의어 셀렉터

      await page.goto(url);

      try {
        const data = await page.$eval(selector, (element) => element.textContent);

        if (!data.includes('반의어')) {
          if (!changedWords[word[0]]) { // changedWords[word[0]]이 없을경우에만 생성
            changedWords[word[0]] = word[1];
          }
        } else {
          const antonymEndingPhrase = [',', '다'];
          // [',', '-다', 대량,정답(,콤마가 없는 2글자일 경우) ]
          const antonymStartIndex = data.indexOf('반의어') + 5;

          let antonymEndIndex = null;
          let antonym;

          for (let i = antonymStartIndex + 1; i < antonymStartIndex + 9; i++) {
            for (let j = 0; j < antonymEndingPhrase.length; j++) {
              // 반의어가 2개이상일 경우 사랑 => 미움, 증오
              // 반의어가 '다'로 끝나지 않을수도있음 1) 많다(적다, 작다), 가다, 적다, 오다 2) 더럽다 3) 깨끗하다 4) 다양하다
              if (data[i] === antonymEndingPhrase[j]) {
                antonym = data.slice(antonymStartIndex, i);

                changedWords[word[0]] = antonym;
                i = data.length;

                break;
              }

              if (i === antonymStartIndex + 8) {
                console.log('entered');
                antonymEndIndex = antonymStartIndex + 2;
                antonym = data.slice(antonymStartIndex, antonymEndIndex);

                changedWords[word[0]] = antonym;
              }

              break;
            }
          }
        }
      } catch (err) { // 검색결과가 없을 경우 null 처리
        changedWords[word[0]] = word[1];
      }
    }

    changeOriginalDiaryIntoFantasiaDiary();
  }

  async function changeOriginalDiaryIntoFantasiaDiary() {
    // replace 하기
    console.log('changedWords', changedWords);
    let diaryDocument = '';

    diarySentences.forEach(item => {
      diaryDocument = `${diaryDocument}/${item}`;
    });

    const diarySentimentData = await getSentimentScore(diaryDocument);

    for (const item in changedWords) {
      if (changedWords[item].includes('VV')) { // '안'
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed'; // null 과 undefined는 err를 던져서 다른 값을 인위적으로 설정해줌
      }

      if (changedWords[item].includes('VA')) { // '못'
        diaryDocument = diaryDocument.replace(item, `못 ${item}`);

        changedWords[item] = 'changed';
      }

     if (changedWords[item].includes('NNG')) { // NNG => 명사 이거나 다양하다 같은얘들....
      if (item[item.length - 1] === '다') { // 노력하다, 노력하는
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed';
      } else {
        changedWords[item] = item; // value 값에 'NNG'값을 key값으로 바꿔줌
      }
     }

     if (changedWords[item].includes('NNP')) { // NNG => 명사 이거나 다양하다 같은얘들....
      if (item[item.length - 1] === '다') {
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed';
      } else {
        changedWords[item] = item; // value 값에 'NNG'값을 key값으로 바꿔줌
      }
     }

     if (changedWords[item] !== 'changed') {
      diaryDocument = diaryDocument.replace(item, changedWords[item]);
     }
    }

    diaryDocument = diaryDocument.split('/').slice(1); // diaryDocument 맨 앞에 /(슬래쉬) 없애야함
console.log('diaryDocument', diaryDocument);

    saveFantasiaDiary(diaryDocument, diarySentimentData);

    return;
  }

  async function getSentimentScore(entireDiary) {
    console.log('entireDiary', entireDiary);
    const sentimentAverage = await sentimentAnalysis(entireDiary);
    const sentimentColor = getFantasiaColor(sentimentAverage);

    function getFantasiaColor(sentimentAverage) {
      const positiveColor = '#C9463D';
      const neutralColor = '#A4CFBE';
      const negativeColor = '#A67D65';

      if (sentimentAverage < -0.25) {
        return negativeColor;
      }

      if (sentimentAverage < 0.25) {
        return neutralColor;
      }

      if (sentimentAverage < 1) {
        return positiveColor;
      }
    }

    return [sentimentAverage, sentimentColor];
  }

  async function saveFantasiaDiary(fantasiaDiarySentences, diarySentimentData) {
    console.log('diarySentimentData', diarySentimentData);
    const [ average, color ] = diarySentimentData;

    // diaryText 부정어 => 긍정어로 변환
    for (let i = 0; i < blocks.length; i++) {
      blocks[i].text = fantasiaDiarySentences[i]; //글이 달라지면 스타일 적용한것도 달라지는거 아닌가여?
    }

    const fantasiaDiaryData = {
      creator: originalDiaryData.creator,
      details: JSON.stringify(fantasiaDiaryText),
      sentiment_Average: average,
      fantasia_level_color: color
    };
    console.log('fantasiaDiaryData', fantasiaDiaryData.details);
    try {
      const newFantasiaDiary = await FantasiaDiary.create(fantasiaDiaryData);

      await OriginalDiary.findByIdAndUpdate(
        newDiaryId,
        { $addToSet: { fantasia_diary_id: newFantasiaDiary._id } }
      );

      return res.status(200).json({
        result: statusMessage.success
      });
    } catch (err) {
      next(err);
    }
  }
};

exports.getDiaryListForRequestedMonth = async function (req, res, next) {
  try {
    const { year, month } = req.query;

    const requestDiaryList = await OriginalDiary.find({ yearAndMonth: `${year}-${month}`})
                                                .populate('fantasia_diary_id');

    return res.status(200).json({
      diaryList: requestDiaryList
    });
  } catch (err) {
    next(err);
  }
};
