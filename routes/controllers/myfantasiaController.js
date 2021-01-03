const mecab = require('mecab-ya');
const puppeteer = require('puppeteer');

const User = require('../../models/User');
const OriginalDiary = require('../../models/OriginalDiary');
const FantasiaDiary = require('../../models/FantasiaDiary');

const { statusMessage } = require('../../constants/statusMessage');
const { errorMessage } = require('../../constants/errorMessage');
const { sentimentColorName } = require('../../constants/sentimentColorName');
const { sentimentAnalysis } = require('../../config/googleCNL');

exports.getDiaryListForRequestedMonth = async function (req, res, next) {
  try {
    const { year, month } = req.query;

    const requestDiaryList = await OriginalDiary.find({ yearAndMonth: `${year}-${month}`})
                                                .populate('fantasia_diary_id');

    return res.status(200).json({
      diaryList: requestDiaryList
    });
  } catch (err) {
    err.result = statusMessage.fail;
    err.message = errorMessage.failToGetDiaryList;

    next(err);
  }
};

exports.saveOriginalDiary = async function saveOriginalDiary(req, res, next) {
  const {
    data : originalDiaryData,
    fantasiaDiaryItem: fantasiaDiaryText
  } = req.body;
  const { creator } = req.body.data;

  const newOriginalDiary = await OriginalDiary.create(originalDiaryData);
  const { _id : newDiaryId } = newOriginalDiary;

  await User.findByIdAndUpdate(
    creator,
    { $addToSet: { original_diary_list: newDiaryId } }
  );

  const { blocks } = fantasiaDiaryText;

  let index = 0;
  let jdex = 0;

  const diarySentences = blocks.map(item => item.text);

  let divideSentenceIntoWord = diarySentences[index].split(' ');
  let anAndMotContainer = [];

  const wordsForCrawling = [];
  const changedWords = {};

  getAnalyzeWord();

  function getAnalyzeWord() {
    mecab.pos(divideSentenceIntoWord[jdex], (err, result) => {
      jdex++;

      classifyWordForCrawling(result, jdex);

      if (jdex === divideSentenceIntoWord.length) {
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
    const negativePhrase = ['안', '못'];
    const endingPhrase = ['EP', 'EC', 'EF', 'ETM', 'NNG', 'NNP'];
    const predicate = ['VV', 'VA', 'NNG', 'XR'];

    for (let i = 0; i < result.length; i++) {
      if (anAndMotContainer.length) {
        for (let k = 0; k < predicate.length; k++) {
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
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
    });

    const page = await browser.newPage();

    for await (let word of wordsForCrawling) {
      let url = `https://ko.wiktionary.org/wiki/${word[0]}`;
      let selector = '#mw-content-text > div.mw-parser-output';

      await page.goto(url);

      try {
        const data = await page.$eval(selector, (element) => element.textContent);

        if (!data.includes('반의어')) {
          if (!changedWords[word[0]]) {
            changedWords[word[0]] = word[1];
          }
        } else {
          const antonymEndingPhrase = [',', '다'];
          const antonymStartIndex = data.indexOf('반의어') + 5;

          let antonymEndIndex = null;
          let antonym;

          for (let i = antonymStartIndex + 1; i < antonymStartIndex + 9; i++) {
            for (let j = 0; j < antonymEndingPhrase.length; j++) {
              if (data[i] === antonymEndingPhrase[j]) {
                antonym = data.slice(antonymStartIndex, i);

                changedWords[word[0]] = antonym;
                i = data.length;

                break;
              }

              if (i === antonymStartIndex + 8) {
                antonymEndIndex = antonymStartIndex + 2;
                antonym = data.slice(antonymStartIndex, antonymEndIndex);

                changedWords[word[0]] = antonym;
              }

              break;
            }
          }
        }
      } catch (err) {
        changedWords[word[0]] = word[1];
      }
    }

    changeOriginalDiaryIntoFantasiaDiary();
  }

  async function changeOriginalDiaryIntoFantasiaDiary() {
    let diaryDocument = '';

    diarySentences.forEach(item => {
      diaryDocument = `${diaryDocument}/${item}`;
    });

    const diarySentimentData = await getSentimentScore(diaryDocument);

    for (const item in changedWords) {
      if (changedWords[item].includes('VV')) {
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed';
      }

      if (changedWords[item].includes('VA')) {
        diaryDocument = diaryDocument.replace(item, `못 ${item}`);

        changedWords[item] = 'changed';
      }

     if (changedWords[item].includes('NNG')) {
      if (item[item.length - 1] === '다') {
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed';
      } else {
        changedWords[item] = item;
      }
     }

     if (changedWords[item].includes('NNP')) {
      if (item[item.length - 1] === '다') {
        diaryDocument = diaryDocument.replace(item, `안 ${item}`);

        changedWords[item] = 'changed';
      } else {
        changedWords[item] = item;
      }
     }

     if (changedWords[item] !== 'changed') {
      diaryDocument = diaryDocument.replace(item, changedWords[item]);
     }
    }

    diaryDocument = diaryDocument.split('/').slice(1);

    saveFantasiaDiary(diaryDocument, diarySentimentData);

    return;
  }

  async function getSentimentScore(entireDiary) {
    const sentimentAverage = await sentimentAnalysis(entireDiary);
    const sentimentColor = getFantasiaColor(sentimentAverage);

    function getFantasiaColor(sentimentAverage) {
      const positiveColor = sentimentColorName.lightRed;
      const neutralColor = sentimentColorName.lightGreen;
      const negativeColor = sentimentColorName.lightBrown;

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
    const [ average, color ] = diarySentimentData;

    for (let i = 0; i < blocks.length; i++) {
      blocks[i].text = fantasiaDiarySentences[i];
    }

    const fantasiaDiaryData = {
      creator: originalDiaryData.creator,
      details: JSON.stringify(fantasiaDiaryText),
      sentiment_Average: average,
      fantasia_level_color: color
    };

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
      err.result = statusMessage.fail;
      err.message = errorMessage.failToSaveFantasiaDiary;

      next(err);
    }
  }
};
