# ChatGPT Character Images

ChatGPTの回答に状態別のキャラクター画像を表示するTampermonkey userscriptと、オリジナル画像のセットです。

## インストール

1. ブラウザに[Tampermonkey](https://www.tampermonkey.net/)をインストールします。
2. [userscriptを直接インストール](https://raw.githubusercontent.com/tsukao2240/chatgpt-character-images/main/chatgpt-character-state.user.js)し、Tampermonkeyの確認画面で「インストール」を選びます。
3. ChatGPTのカスタム指示に、下記の「カスタム指示への追記文」を追加します。
4. ChatGPTのページを再読み込みします。

スクリプトは各アシスタント回答に含まれる `[[STATE:状態名]]` を検出します。タグ文字列を非表示にし、対応する画像を回答の先頭付近へ表示します。ChatGPTのストリーミング回答やページ内遷移にも自動で追従します。

## カスタム指示への追記文

```text
各回答の冒頭に、内容に最も合う状態タグを次の8種類から必ず1つだけ出力してください。
[[STATE:normal]] / [[STATE:observe]] / [[STATE:think]] / [[STATE:answer]] / [[STATE:question]] / [[STATE:important]] / [[STATE:deny]] / [[STATE:standby]]
タグは完全に同じ書式で、コードブロックには入れず、タグより前には何も書かないでください。その後に通常どおり回答してください。
```

## 状態対応表

| 状態タグ | 用途の目安 | 画像 |
| --- | --- | --- |
| `[[STATE:normal]]` | 通常の会話 | `images/01_normal.png` |
| `[[STATE:observe]]` | 観察・確認 | `images/02_observe.png` |
| `[[STATE:think]]` | 思考・検討 | `images/03_think.png` |
| `[[STATE:answer]]` | 回答・解決 | `images/04_answer.png` |
| `[[STATE:question]]` | 質問・確認依頼 | `images/05_question.png` |
| `[[STATE:important]]` | 重要事項・注意喚起 | `images/06_important.png` |
| `[[STATE:deny]]` | 否定・拒否 | `images/07_deny.png` |
| `[[STATE:standby]]` | 待機・保留 | `images/08_standby.png` |

## ファイル

- [`chatgpt-character-state.user.js`](https://github.com/tsukao2240/chatgpt-character-images/blob/main/chatgpt-character-state.user.js)
- [`images`](https://github.com/tsukao2240/chatgpt-character-images/tree/main/images)
