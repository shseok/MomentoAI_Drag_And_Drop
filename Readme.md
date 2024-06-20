# 드래그 앤 드롭 기능 구현

이 프로젝트는 Webpack 설정을 직접 구성하고, 주어진 요구사항에 따라 동작하는 드래그 앤 드롭 기능을 구현하는 과제입니다. `react-beautiful-dnd` 라이브러리를 사용하여, 지정된 드래그 제약 조건을 만족해야합니다.

## 기능

- **Webpack 적용**: `react-scripts`를 사용하지 않고, Webpack을 직접 설정하여 React 애플리케이션을 구성합니다.
- **칼럼 확장**: 기존의 한 칼럼에서 네 개의 칼럼으로 확장합니다.
- **드래그 제약 조건 적용**: 특정 규칙에 따라 아이템의 드래그를 제한합니다.
  - 첫 번째 칼럼에서 세 번째 칼럼으로는 아이템 이동이 불가능해야 합니다.
  - 짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.
  - 이동할 수 없는 지점으로 아이템을 드래그 할 경우, 제약이 있음을 사용자가 알 수 있도록 합니다.
    (ex. 드래그 중인 아이템의 색상이 붉은색으로 변경됨 등)
- **멀티 드래그 기능 구현**: 여러 아이템을 동시에 선택하고 드래그하는 기능을 추가합니다.

## 실행 방법

```
$ git clone https://github.com/shseok/MomentoAI_Drag_And_Drop.git
$ cd MomentoAI_Drag_And_Drop/
$ npm install
$ npm run dev
```

## 주요 커밋 요약

#### init: webpack 설정

`webpack.config.js` 파일을 직접 설정하고 파일구조를 변경하여 React 애플리케이션을 빌드할 수 있습니다.

#### init: typescript 설정 및 webpack 수정

컴파일 시점에 에러를 캐치하기 위해 typescript를 사용하고자 설정을 진행해주었습니다.

#### init: tailwindcss 설정

개발 속도를 위해 tailwindcss를 사용하고자 설정을 진행해주었습니다.

#### feat: 하나의 칼럼을 네개의 칼럼으로 확장

column을 추가해주었습니다. 해당 코드는 `멀티 드래그 구현`에서 리팩토링되었습니다.

#### feat: 드래그 제약 조건 적용

단일 짝수 아이템을 같은 열 혹은 다른 열로 드래그할 때, 아이템을 붉은색으로 표시하여 제약을 주었습니다. 해당 코드는 `멀티 드래그 구현`에서 리팩토링되었습니다.

![녹화_2024_06_20_09_34_55_226](https://github.com/shseok/MomentoAI_Drag_And_Drop/assets/80726955/7e88c089-b1f6-4785-9a6c-9405bcdcd484)

#### feat: 멀티 드래그 구현

`shift`, `ctrl` 기능을 통해 멀티 드래그가 가능합니다.

> `types`, `utils`, `data`, `components`로 분리하여 코드를 분리하여 리팩토링을 진행했습니다.

![녹화_2024_06_20_09_36_04_654](https://github.com/shseok/MomentoAI_Drag_And_Drop/assets/80726955/3115ae53-733d-4985-a3e8-a32484e18914)

#### feat: local storage 적용 및 초기화 버튼 추가

커스텀훅 `useLocalStorage.ts`을 사용하여 유저가 드래그한 정보들을 브라우저에 저장합니다. 새로고침해도 사용할 수 있는 데이터이며 reset 버튼으로 초기화할 수 있습니다.

## 추후 추가될 기능

#### add item (with each column)

각 열에서 아이템들을 추가합니다.

#### delete item

각 아이템을 삭제합니다.

#### edit item

각 아이템 title을 수정합니다.
