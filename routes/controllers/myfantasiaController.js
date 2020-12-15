const mecab = require('mecab-ya');
const puppeteer = require('puppeteer');

const OriginalDiary = require('../../models/OriginalDiary');
const FantasiaDiary = require('../../models/FantasiaDiary');

const { statusMessage } = require('../../constants/statusMessage');
const { sentimentAnalysis } = require('../../config/googleCNL');

exports.saveOriginalDiary = async function saveOriginalDiary(req, res, next) {
  const { data : originalDiaryData } = req.body;  // 레퍼런스 111
  // const newOriginalDiary = await OriginalDiary.create(originalDiaryData); // new Originaldiary 생성

  const fantasiaDiary = originalDiaryData.details; // 일기 원문, 레퍼런스 222
  // 이 상태 그대로 db에 저장(객체상태) => frontend로 보내서 convertFromRow
  const { blocks } = fantasiaDiary; // 레퍼런스 333

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
    const endingPhrase = ['EP', 'EC', 'EF', 'ETM', 'NNG'];
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

  function changeOriginalDiaryIntoFantasiaDiary() {
    // replace 하기
    console.log('changedWords', changedWords);
    let diaryDocument = '';

    diarySentences.forEach(item => {
      diaryDocument = `${diaryDocument}/${item}`;
    });

    for (const item in changedWords) {
      if (diaryDocument.includes(item)) {
        diaryDocument = diaryDocument.replace(item, changedWords[item]);
      }
    }

    console.log('diaryDocument', diaryDocument);
  }


  // const sentimentAverage = await sentimentAnalysis(diaryDocument);
  // const fantasiaLevelColor = getFantasiaColor(sentimentAverage);

  // const getFantasiaColor = (sentimentAverage) => {
  //   const positiveColor = 'pink';
  //   const neutralColor = 'grey';
  //   const negativeColor = 'black';

  //   if (sentimentAverage < -0.25) {
  //     return negativeColor;
  //   }

  //   if (sentimentAverage < 0.25) {
  //     return neutralColor;
  //   }

  //   if (sentimentAverage < 1) {
  //     return positiveColor;
  //   }
  // };


  // diaryText 부정어 => 긍정어로 변환

  // for (let i = 0; i < blocks.length; i++) {
  //   blocks[i].text = positiveDiaryText[i]; //글이 달라지면 스타일 적용한것도 달라지는거 아닌가여?
  // }

  // const fantasiaDiaryData = {
  //   creator: originalDiaryData.creator,
  //   details: fantasiaDiary,
  //   sentiment_Average: sentimentAverage,
  //   fantasia_level_color: fantasiaLevelColor
  // };

  // const newFantasiaDiary = await FantasiaDiary.create(fantasiaDiaryData);
  // await OriginalDiary.findByIdAndUpdate({ fantasia_diary_id: newFantasiaDiary._id });

  // return res.status(200).json({
  //   result: statusMessage.success
  // });
  // } catch (err) {
  //   next(err);
  // }
};
