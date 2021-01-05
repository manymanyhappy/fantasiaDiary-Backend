# 📝 환상의 일기장
<img src='https://drive.google.com/uc?id=1lgYcx0JFAwDzvjLc8DZzCFjtWjjIDsiA' alt='thumbnail'>

- 하루를 기록할 수 있는 웹 일기장입니다.
- 일기장에 담긴 감정을 구글 자연어 API로 분석하고, 감정을 시각화 할 수 있습니다.
- 하루의 일기장을 반대 말로 바꾸어, 환상의 일기장과 현실일기장을 제공합니다.

## 🌱 Link

- Frontend Repoistory
[https://github.com/manymanyhappy/fantasiaDiary-Frontend](https://github.com/manymanyhappy/fantasiaDiary-Frontend)

- Backend Repository
[https://github.com/manymanyhappy/fantasiaDiary-Backend](https://github.com/manymanyhappy/fantasiaDiary-Backend)


## 🏃‍♂️ How to run

1. Local 환경에서 실행 하기 위해선, 다음 사항이 필요합니다.  
1-1. [Firebase API Key](https://firebase.google.com/)  
1-2. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  
1-3. [Google GNL API](https://cloud.google.com/natural-language/docs/reference/libraries?hl=ko#setting_up_authentication)  

2. 1이 준비되었다면, 아래와 같이 설정해주세요.

```
* Frontend

1. git clone

git clone https://github.com/manymanyhappy/fantasiaDiary-Frontend.git

2. 1-1 Firebase API Key 링크로 접속하여 Key를 생성해주세요.

3. Root 디렉토리에 .env파일을 만들고, 다음과 같이 Firebase API Key를 입력해주세요.

REACT_APP_API_KEY=<Your Firebase API Key>
REACT_APP_AUTH_DOMAIN=<Your Firebase Auth Domain>
REACT_APP_PROJECT_ID=<Your Firebase Project Id>
REACT_APP_STORAGE_BUCKET=<Your Firebase Storage Bucket>
REACT_APP_MESSAGING_SENDER_ID=<Your Firebase Messaging Sender Id>
REACT_APP_APP_ID=<Your Firebase App Id>

4. cd fantasiaDiary-Frontend

5. npm install

6. npm start

```
```
* Backend

1. git clone

git clone https://github.com/manymanyhappy/fantasiaDiary-Backend.git

2. 1-2 MongoDB Atlas에 접속하여 URI를 생성하세요.

3. Secret Key를 설정하세요.

4. Root 디렉토리에 .env파일을 만들고, 다음과 같이 2,3번을 차례대로 입력하세요.

MONGODB_ATLAS_URI=<Your MongoDB Atlas URI>
SECRET_KEY=<Your Secret Key>

5. 1-3 Google GNL링크로 들어가 JSON파일을 만들어주세요.

6. Root 디렉토리에 credentials 폴더를 만들고, 5.에서 만들어진 JSON 파일을 넣어주세요.

7. .env 파일에 다음 사항을 추가해주세요.

GOOGLE_APPLICATION_CREDENTIALS='credentials/<Your JSON Filename>'

3. cd fantasiaDiary-Backend

4. npm install

5. npm run dev

```

## 👀 프로젝트 동기

일기에는 좋은 일도, 나쁜 일도 모두 담깁니다.  
그리고 형식에 구애 받지 않고, 내가 쓰고싶은 대로 쓸 수 있죠. 그렇다보면 자신의 진짜 ***'감정'*** 이 드러납니다.  

그 감정들은 한 장 한 장에 담겨 한 권이 되고 한 권, 한 권이 쌓이지만,  
결국엔 먼지가 쌓이고 다 살펴볼 수도 없게됩니다.

제 동생이 초등학교 일기장을 27살이 될 동안 가지고 있었지만,  
성인이 되고 한 번도 펼쳐보지 않은 것처럼요.  

그래서 그 일기를 짐처럼 쌓아두고 있을 필요가 없는 ***온라인 일기장*** 을 만들고 싶었습니다.  
거기에 한 장 한 장 살펴 보지 않아도, 그 안 에 담긴 감정들을 ***시각화*** 해서 보여주면 재밌겠다고 생각했습니다.  


그러던 중 멘토님이

***'일기의 내용을 반대로 바꿔서 보여주는 건 어떨까요?'***

라는 아이디어를 던져주셨습니다.

오?  
이렇게 저의 두 번째 프로젝트,  
환상의 일기장이 시작되었습니다.

## 🧩 STACK

| Frontend           | Frontend           |
| :----------------: | :----------------: |
| React              | Node.js            |
| Redux              | Express            |
| Styled Component   | MongoDB            |
| Axios              | Mongoose           |
| Firebase           | JWT                |
| Date-Fns           | Puppeteer          |
| ES2015+            |                    |

## 🤓  프로젝트 설명

### 1. 일기는 미루면 의미가 없습니다.

<img src='https://drive.google.com/uc?id=1SbfYNx45wk2Ro0PueMIaWvpVBKdQqnSb' alt='writeDiary'>

방학 때, 일기 쓰기를 미루었다가 개학 전날 한 꺼번에 쓴 경험 있으시죠?  
환상의 일기는 매일 딱 한 번 기록할 수 있습니다. 일기는 그 날의 감정에 충실해야하니깐요!

### 2. 일기 속 감정을 "색"으로 달력에 시각화하고 그래프로 볼 수 있습니다.

<img src='https://drive.google.com/uc?id=1Nhtr-xhX829_UlKiHUSVcyh1etetQQ7x' alt='calendar'>
<img src='https://drive.google.com/uc?id=1K2vEsdPa-nrKNHfLHjjDMqaKe8KE9924' alt='d3graph'>

내가 쓴 일기를 구글 자연어 API가 분석하고, 그 수치에 따라  달력에 색으로 표기됩니다.  
그 달에 내가 어떤 감정을 느꼈는지 달력에서 한 눈에 확인 할 수 있습니다. 그리고 그래프로도 확인할 수 있습니다.

### 3. 내가 쓴 일기를 반대로 기록한 "환상의 일기"를 경험하세요!

<img src='https://drive.google.com/uc?id=1vha1F6ik_Pa93oU65D6fJOHNphPxze4a' alt='calendar'>
<img src='https://drive.google.com/uc?id=1SIsOo0aFfYiXX3DEznUUN6hSOyhzl8Z_' alt='d3graph'>
<img src='https://drive.google.com/uc?id=1sa-uoSWYBfR1ZAzmGZE_pMGc1CD7W-DN' alt='d3graph'>

기분이 나쁜 날 쓴 일기는 다음에 봐도 그 기분이 살아나잖아요?   
그럴 땐, 반대말로 쓰여진 환상의 일기를 보고, 어처구니없어서 웃어보시는거 어떨까요?   

## 📆  작업기간

### 🔥 아이디어 브레인 스토밍 및 기술 스택 서치(11월 30일 ~ 12월 5일 (1주))

아이디어 브레인 스토밍  

11월 30일 ~ 12월 2일(3일)  

기술 스택 서치  
12월 3일 ~ 12월 5일 (3일)

### 🌪 개발 (12월 6일 ~ 12월 19일 (2주))

## ✂️ 아이디어 변천사

- **초기**
1. 일기장을 만들고 싶다.
2. 일기장에 쓰여진 감정을 비교/분석해서 보여줄수는 없을까?
3. 그 날의 일기 속 감정을 색으로 표기해주자!

- **중기**
1. 감정만 표기하려니까 너무 단순해 지는거 같은데?
2. 멘토님 왈 ' 일기를 반대로 바꾸는건 어때요?'
3. 일기 속 단어를 긍정 ⇒ 부정, 부정 ⇒ 긍정으로 바꿔보는거야!

- **결말**   
프로젝트를 마친 소감에서 확인하세요!

</br>

## 🌺 MOCK UP VS 최종본

<img src='https://drive.google.com/uc?id=1XzXfnPzvvC-uFp8D3yj28Wf15cBpAWYT' alt='compare'>  

## 🏆 스스로 내리는 환상의 일기장 총 평

>
> ***환상의 일기장. . .~~환장~~이 될 뻔 하다.***  
>

**🔥 서론**  

프로젝트가 끝나고 저는 환상의 일기장 부제를 지었습니다. 부제는 바로 환장의 일기장..입니다.  

***왜냐하면 기존의 계획한 것을 구현할 때마다 예기치 못한 문제에 봉착해,  
새로운 기술과 아이디어를 접목시켜야했기 때문이죠.***

제 프로젝트에서 가장 큰 포인트는 단어를 어떤식으로 치환할 것인가? 에 대한 부분입니다.  
실제로 프로젝트 기간의 절반을 그 부분에 할애하기도 했구요.

처음에는

1) 일기속 문장을 단어로 쪼개고,
2) 단어를 국어사전에 검색하여, 반의어 항목에 있는 단어로 치환

이렇게 하면 로직이 완성되겠다! 빨리 끝나면 다른 기능들도 추가해야겠다라고 생각했습니다.  
하지만, 이 생각이 정말 단순하고, 단순한 생각이었음을 아주 빨리 깨닫게되었습니다.

</br>
***
</br>

**🌪 본론 - Challenges 1**  

```
💡 텍스트를 데이터로 다루는 것은 제가 생각했던 것보다 훨씬 큰 분야였습니다.
```

텍스트를 데이터로 다루는 것을 **텍스트 마이닝(Text Mining)** 이라고 합니다.  
그 텍스트는 "인간의 말"에서 비롯됩니다.  
하지만 "인간의 말"은 형태가 매우 다양하고 복잡해서 일관된 규칙을 적용하는 것이 어렵습니다.  

또한 한국어는 **교착어**라고 하는데요.  
밑에 예시를 보시면 쉽게 이해하실 수 있습니다.  

```
나는 집에 간다.
I go to my home.

나는 피자를 먹었다
I eat pizza.
```

영어와 다르게 조사가 단어에 붙어있죠.  
***즉, 단순히 문장.split(' ')한다고 해서 해결될 문제가 아니었다. 이것입니다.....!***

```
✅  그래서 저는 이 치환로직에서 *선택과 집중*을 하여  
    모든 단어를 반대말로 바꾸기 보다는, 형용사와 동사를 반대로 바꾸기로 결정했습니다.  

    하지만 문장에서 형용사와 동사를 뽑아내는 것 또한 쉬운일은 아니었습니다.  
    문장을 의미가 없어질 때까지 쪼개는 "형태소 분리"라는 것을 해야했고,  
    형태소 분리를 통해 넘어오는 데이터를 케이스별로 나누어, 단어를 뽑아내었습니다.
```

</br>

***

</br>

**🌪 본론 - Challenges 2**

</br>

```
💡 단어를 뽑아내는 과정을 끝내고, 사전에 검색을 해야할 차례가 되었습니다.  
```

그런데, 네이버나 다음 사전들이 API를 중단했다네요!?  
그마나 API를 제공하는 국립국어원은 반의어를 제공하지 않는다네요?!  
```
✅  그래서 저는 해결책으로 쓸거라고 예상하지도 않았던 *크롤링*을 하게되었습니다.
```
하지만 크롤링을 통해 모든 단어에 대한 반의어를 뽑아낼 수는 없었습니다.  
왜냐하면 국어사전을 검색할때는 검색하고자하는 단어의 원형을 검색해야하기 때문이죠.  

갔다의 반의어를 검색하려면 갔다의 원형인 '가다'를 입력해야합니다.  
```
✅  그래서 크롤링을 통해 *반의어가 나온 것들은 그대로 이용*하고,  
    크롤링을 통해 반의어가 *나오지 않은 것들은 한국어의 부정 부사 '안 / 못'을 붙이기로* 했습니다.
```
</br>

***

</br>

**💥 결론 - 나에게 환상일기장이란?**

이렇게 저의 환상의 일기장 로직이 완성(?)되었습니다.  

이 로직을 짜는 과정에서 끊임없이 생겨나는 예기치못한 케이스들을 다루고,  
일정 규칙으로 편입시키는 과정이 1주일정도 되다보니 스스로 불안함을 많이느꼈습니다.  

다른 친구들은 이런기능 저런기능 완성해나가고 있는데,  
저는 이 로직하나에만 1주일을 매달려있었기때문이죠.  

***프로젝트를 끝내고 든 생각은 이것을 구현해 나가는 과정에서  
스스로 무엇을 생각했고, 무엇을 깨달았는지가 가장 중요하다 것이었습니다.***  

실제로 제 환상일기장 치환은 완벽하지 않습니다.  
말이 안되게 치환이 될 때도 있고, 어떨 때는 알 수 없는 단어들이 나오기도 합니다.  


하지만 내가 무엇에 선택과 집중을 했는지,  
어떤 문제에 부딪혔을 때 이렇게 해결했다고 당당하게 말할 수 있고,    

전에는 사용해 보지 못했던 것 기술들을 사용해본 경험으로 인해  

예전에는 "새로운 기술을 사용해 보세요"라는 말에 "아냐 나는 못해"라는 말이 먼저 나왔지만,  
이제는 "해 볼게요. 할 수 있을 것 같아요" 라는 말이 먼저 나올 수 있는 자신감을 얻었습니다.

환상의 일기장이 환장의 일기장이라는 부제를 얻었지만,  
***환상의 일기장은 저에게 "환상의 기회"였다***고 정의 내리며 페이지를 마칩니다.
