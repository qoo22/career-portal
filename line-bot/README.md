# AI先生 財テク＆サイドFIRE公式LINE 自動返信GAS導入マニュアル

本ディレクトリの `Code.gs` は、LINE公式アカウント（@227lwvnm）とOpenAI API（gpt-4o-mini）を連携させ、読者からの資産形成・新NISA・ふるさと納税・固定費・サイドFIRE相談に24時間自動返信しつつ、ASPアフィリエイトリンクへ高成約率で送客するシステムです。

---

## 1. 導入・更新手順（約3分）

### ステップ1：Google Apps Scriptエディタを開く
Google Drive内の既存GASプロジェクト「**LINE相談bot**」を開きます。
- URL: https://script.google.com/d/1p3Sexn08PEvqyFBdVWwHLm7McB3eq2AT_xSxLqm6EGgW5b8HZenYOdxG/edit

### ステップ2：コードの貼り付け
1. `コード.gs`（または `Code.gs`）の内容を全て選択して削除します。
2. 本ファイル（`career-portal/line-bot/Code.gs`）の全コードをコピーして貼り付けます。
3. エディタ上部の「保存（フロッピーアイコン）」をクリックします。

### ステップ3：新しいデプロイを作成（反映）
1. 画面右上の **「デプロイ」>「新しいデプロイ」** をクリックします。
2. 種類で「**ウェブアプリ**」を選択します。
   - **説明**: `v2: 財テク＆サイドFIRE自動相談＋ASPアフィリ送客版`
   - **次のユーザーとして実行**: `自分 (quechoco44@gmail.com)`
   - **アクセスできるユーザー**: `全員 (Anyone)`
3. 「**デプロイ**」をクリックします。
4. 発行されたウェブアプリURLが以下のURLと同一であることを確認します（異なる場合はLINE Developers側のWebhook URLを更新します）。
   - 既存Webhook URL: `https://script.google.com/macros/s/AKfycbwA6-BoJ5mT7SCCBVw5HoysNVFlDGdgNBjYXMZXj6SYgVsm_aj0GpMa_8uPfdWVgdUP7g/exec`

---

## 2. LINE Developers側の設定確認
1. [LINE Developersコンソール](https://developers.line.biz/) にログイン。
2. 対象チャネルの「Messaging API設定」タブを開く。
3. **Webhook URL** が設定済み（検証「成功」）になっていることを確認。
4. **Webhookの利用** を「オン」にする。
5. **応答メッセージ**（LINE公式アカウント管理画面）で「AI応答メッセージ」「自動応答」をオフにし、Webhookのみで返信するよう設定。

---

## 3. アフィリエイト収益化の仕組み（ASPリンク差し替え）
`Code.gs` 内の `AFFILIATE_LINKS` オブジェクトに、各ASP（A8.net、アクセストレード、TCS、楽天アフィリエイト等）で発行した個別のアフィリエイトリンクを代入することで、LINE経由の成約報酬が直接口座に振り込まれます。

```javascript
const AFFILIATE_LINKS = {
  SBI_SEC: 'https://px.a8.net/svt/ejp?a8mat=...',          // SBI証券 口座開設 (報酬: 約2,000〜15,000円)
  RAKUTEN_SEC: 'https://px.a8.net/svt/ejp?a8mat=...',      // 楽天証券 口座開設 (報酬: 約1,500〜10,000円)
  RAKUTEN_FURUSATO: 'https://hb.afl.rakuten.co.jp/hgc/...', // 楽天ふるさと納税 (報酬: 寄付額の1〜5%)
  SATOFULL: 'https://px.a8.net/svt/ejp?a8mat=...',         // さとふる (報酬: 固定または料率)
  FP_CONSULT: 'https://px.a8.net/svt/ejp?a8mat=...',       // 無料FPオンライン相談 (報酬: 10,000〜25,000円/件)
  FIRE_SIM: 'https://qoo22.github.io/career-portal/fire/simulator.html'
};
```
