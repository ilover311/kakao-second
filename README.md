# 2018 1st KAKAO blient recruitment second round

## SPEC
    node >= 7.11
    npm 

## 실행방법

아래순서대로 실행하면 됩니다.

1. npm i
2. node index.js

## 구현 방법
node.js 의 기본 패키지 http 와 모듈인 request 를 통해서 http 통신을 했습니다.

http.request를 promise로 감싸서 통신에 대해서 httpRequester promise를 호출했습니다.
Delete method 에 대해서는 http가 정상작동 되지 않는 것으로 보여, request 노드 모듈을 사용했습니다.

함수의 부분을 각 부분에 따라 나뉘었습니다.

1. SeedProc : seed doc을 받아오는 함수
2. getDocument : doc path을 받아와서 add, del를 불러주고 next_doc path로 재귀적 방법을 하는 함수
3. addProcess : add image들에 대해서 feature를 받아와서 다시 POST해주는 함수
4. deleteProcess : delete image들 대해서 delete 하는 함수

이 함수들에 대해서 처음 프로그램이 시작하면서 token을 받아오게 하고, token을 받아 SeedProc 함수를 부르고
SeedProc에서 doc url들에 대해서 하나씩 getDocument 함수를 불러줍니다

각 불려진 getDocument에서는 images들을 받아옵니다.
images들의 type에 따라서 추가할지 삭제할지 판단하고 각 set에 추가합니다.

addSet이 50개가 되면 addProcess 함수를 불러주고
delSet이 50개가 되면 deleteProcess 함수를 불러줍니다.

그리고 images를 모두 보고나서 next_url를 다시 getDocument에 넘겨서 같은 방식을 재귀적으로 반복하게 합니다.

----------

기본적으로 nodejs 의 promise을 통해 비동기 함수를 통해서 각 task queue에 자동적으로 작업이 될 수 있도록 추가했습니다.