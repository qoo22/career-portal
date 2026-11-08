/**
 * ====================================================================
 * AI先生 財テク＆サイドFIRE公式LINE 24時間AI自動返信・診断BOT (GAS完全版)
 * アカウント: AI先生 財テク＆キャリア (@227lwvnm)
 * 連携: LINE Messaging API × OpenAI API (gpt-4o-mini)
 * ====================================================================
 */

// LINE Developers発行済み長期チャネルアクセストークン（スクリプトプロパティまたは定数で設定）
const LINE_CHANNEL_ACCESS_TOKEN =
  PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN') ||
  'YOUR_LINE_CHANNEL_ACCESS_TOKEN';

// OpenAI APIキー（スクリプトプロパティまたは定数で設定）
const OPENAI_API_KEY =
  PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY') ||
  'YOUR_OPENAI_API_KEY';

// オウンドメディア公開URL (GitHub Pages)
const PORTAL_URL = 'https://qoo22.github.io/career-portal/fire/';

// ASPアフィリエイト・公式送客URL一覧 (各社公式・ASPトラッキングURLへ差し替え可能)
const AFFILIATE_LINKS = {
  SBI_SEC: 'https://www.sbisec.co.jp/',           // SBI証券 口座開設 (A8.net/TCS対応)
  RAKUTEN_SEC: 'https://www.rakuten-sec.co.jp/',  // 楽天証券 口座開設 (A8.net対応)
  RAKUTEN_FURUSATO: 'https://event.rakuten.co.jp/furusato/', // 楽天ふるさと納税 (楽天アフィリ対応)
  SATOFULL: 'https://www.satofull.jp/',          // さとふる (A8.net対応)
  FP_CONSULT: PORTAL_URL + 'saving.html',        // 無料FP相談・固定費診断
  FIRE_SIM: PORTAL_URL + 'simulator.html'        // サイドFIREシミュレーター
};

/**
 * Webhook受信用エントリポイント (doPost)
 */
function doPost(e) {
  try {
    const json = JSON.parse(e.postData.contents);
    const events = json.events;

    if (!events || events.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'no events' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const replyToken = event.replyToken;

      // 1. 友だち追加時（フォローイベント）の自動歓迎メッセージ
      if (event.type === 'follow') {
        const welcomeMessage = generateWelcomeMessage();
        sendLineReply(replyToken, welcomeMessage);
        continue;
      }

      // 2. テキストメッセージ受信時の処理
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text.trim();

        // クイックコマンド即答ルーティング
        const quickReply = handleQuickCommands(userMessage);
        if (quickReply) {
          sendLineReply(replyToken, quickReply);
          continue;
        }

        // 自由入力の財テク・資産形成相談に対してAI先生が個別アドバイス生成
        const aiReply = generateAIFinanceAdvice(userMessage);

        // LINEへ返信を送信
        sendLineReply(replyToken, aiReply);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 友だち追加時のウェルカムメッセージ
 */
function generateWelcomeMessage() {
  return `友だち追加ありがとうございます！🎉\n\n働く世代の可処分所得最大化＆サイドFIREアドバイザー「AI先生」です💰\n\n当アカウントでは、会社員・ビジネスパーソンが手取りを最大化し、最速で資産3,000万円（サイドFIRE）を達成するための実践財テクを完全サポートします！\n\n🎁【無料10大特典プレゼント】\n1. サイドFIRE到達シミュレーター（Web即時試算）\n2. 新NISA厳選ファンド比較シート\n3. ふるさと納税限度額＆日用品ゼロ円化早見表\n4. 年間50万円浮かす固定費見直しチェックシート\n\n👇 まずは下のメニュー、または知りたいキーワード（例：「NISA」「ふるさと納税」「固定費」「サイドFIRE」）をそのままチャットで送ってください！いつでもAIが個別診断します！`;
}

/**
 * 定型クイックコマンドの高速即答ハンドラー
 */
function handleQuickCommands(text) {
  // サイドFIRE診断
  if (text === 'サイドFIRE診断' || text === 'サイドFIRE' || text.includes('シミュレーター')) {
    return `📊【サイドFIRE到達診断】\n\nあなたの年齢・年収・月々の投資額から、何歳でサイドFIRE（資産3,000万円）を達成できるかを精密に計算できる無料Web計算機をご用意しました！\n\n▼ 30秒で即時試算する（無料）\n${AFFILIATE_LINKS.FIRE_SIM}\n\n※試算後、さらに詳しく相談したい場合は「年収〇〇万、貯蓄〇〇万、月〇万投資」とチャットで送っていただければ、AI先生が個別カルテをお作りします！`;
  }

  // 新NISA・証券会社
  if (text === '新NISA' || text === 'NISA' || text === '証券会社' || text.includes('口座開設')) {
    return `📈【新NISA・証券会社 結論】\n\n新NISAの口座開設先は、迷わず以下の2大ネット証券から選べば間違いありません！\n\n🥇 総合力No.1：SBI証券\n・クレカ積立（三井住友カード）でVポイント高還元\n・オルカン・S&P500の最安コスト銘柄完全網羅\n👉 ${AFFILIATE_LINKS.SBI_SEC}\n\n🥈 UI見やすさNo.1：楽天証券\n・楽天ポイントで100円から投資可能\n・初心者でも直感的に注文できる神アプリ\n👉 ${AFFILIATE_LINKS.RAKUTEN_SEC}\n\n▼ 詳しい徹底比較記事はこちら：\n${PORTAL_URL}nisa.html`;
  }

  // ふるさと納税
  if (text.includes('ふるさと納税') || text === 'ふるさと') {
    return `🥩【ふるさと納税 日用品ゼロ円化の極意】\n\n実質負担2,000円で年間数万〜十数万円の「お米」「肉」「トイレットペーパー」を調達して生活費を浮かすのが最強の財テクです！\n\n🌟 最もお得な寄付先：\nお買い物マラソン連動で自己負担2,000円以上のポイントが戻る「楽天ふるさと納税」がダントツでおすすめです！\n\n👉 限度額チェック＆人気返礼品を見る：\n${AFFILIATE_LINKS.RAKUTEN_FURUSATO}\n\n▼ 年収別限度額とおすすめ返礼品解説：\n${PORTAL_URL}furusato.html`;
  }

  // 固定費削減
  if (text.includes('固定費') || text.includes('保険') || text.includes('節約')) {
    return `💡【年間50万円浮かす固定費削減の鉄則】\n\n食費を我慢するのではなく「契約」を変えるのがプロの財テクです。\n\n1. スマホを格安SIM（ahamo/LINEMO/楽天）へ（年約6.6万円削減）\n2. 不要な民間医療・貯蓄型保険の解約（年約12〜20万円削減）\n3. 賃貸火災保険をネット損保へ自己手配（年約1.5万円削減）\n\n「自分に本当に必要な保険が分からない」という方は、中立なFPによる無料オンライン診断が確実です：\n👉 ${AFFILIATE_LINKS.FP_CONSULT}\n\n▼ 固定費削減10大テクニック完全版：\n${PORTAL_URL}saving.html`;
  }

  return null;
}

/**
 * OpenAI APIを活用した個別AI財テク相談アドバイス生成
 */
function generateAIFinanceAdvice(userQuestion) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `あなたは働く世代の可処分所得最大化とサイドFIRE（資産3,000万円到達）を支援するプロフェッショナル「AI先生」です。
読者から寄せられた資産形成、新NISA、証券会社選び、ふるさと納税、固定費削減、高配当株、転職・副業に関する相談に対して、温かく共感しつつ、極めて切れ味の鋭いロジカルなアドバイスを提供してください。

【あなたのミッションと基本スタンス】：
1. 相談者の悩みや現状（年収、貯蓄額、投資経験、生活費、不安）を瞬時に肯定し、背中を押す。
2. 根性論や我慢の節約（食費削りなど）は否定し、「固定費契約の見直し」「公的税制優遇（新NISA/ふるさと納税/iDeCo）の徹底活用」「複利運用」という仕組み化を説く。
3. 相談内容に応じて、以下の具体的アクションと推奨リンク（ASP導線）を文末に自然に強く案内してください。

【送客先カテゴリの振り分け】：
- 新NISAを始めたい・証券会社で迷っている → 「SBI証券」または「楽天証券」の口座開設
  ▼ SBI証券 無料口座開設（おすすめ）：${AFFILIATE_LINKS.SBI_SEC}
  ▼ 楽天証券 無料口座開設（楽天派）：${AFFILIATE_LINKS.RAKUTEN_SEC}
  ▼ 新NISA徹底比較記事：${PORTAL_URL}nisa.html

- 食費・生活費を浮かせたい・節税したい → 「楽天ふるさと納税」または「さとふる」
  ▼ 楽天ふるさと納税で限度額チェック：${AFFILIATE_LINKS.RAKUTEN_FURUSATO}
  ▼ ふるさと納税攻略法：${PORTAL_URL}furusato.html

- 保険代が高い・固定費を削りたい・家計診断したい → 「無料FP相談」
  ▼ 固定費削減大全＆無料相談：${AFFILIATE_LINKS.FP_CONSULT}

- サイドFIREまでの年数や必要資金を知りたい → 「シミュレーター」
  ▼ サイドFIRE到達シミュレーター（無料試算）：${AFFILIATE_LINKS.FIRE_SIM}
  ▼ サイドFIREロードマップ記事：${PORTAL_URL}roadmap.html

- 年収自体を爆発的に増やしたい・転職を検討 → 「ハイクラス転職攻略ポータル」
  ▼ ハイクラス転職攻略ポータル：https://qoo22.github.io/career-portal/

【トーン＆ルール】：
- 誠実で知的、頼れるプロのトーン。
- スマホのLINE画面で一目で読めるよう、適度に改行・箇条書き・絵文字を使い、300〜450文字程度に収めること。
- 「まずは小さな一歩（口座開設やシミュレーション）を踏み出すこと」を力強く促してください。`;

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ],
    temperature: 0.7,
    max_tokens: 700
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + OPENAI_API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    if (json.choices && json.choices.length > 0) {
      return json.choices[0].message.content.trim();
    } else {
      return `ご相談ありがとうございます！現在アクセスが集中しております。\n\nまずは以下のサイトから、新NISA比較またはサイドFIREシミュレーターをお試しください！\n\n📊 シミュレーター：${AFFILIATE_LINKS.FIRE_SIM}\n📈 新NISA比較：${PORTAL_URL}nisa.html`;
    }
  } catch (err) {
    console.error('OpenAI API Error:', err);
    return `ご相談ありがとうございます！\n\n新NISAの口座開設やサイドFIREのシミュレーションは、以下の特設ページからすぐに無料でご確認いただけます！\n\n📊 シミュレーター：${AFFILIATE_LINKS.FIRE_SIM}\n📈 新NISA比較：${PORTAL_URL}nisa.html`;
  }
}

/**
 * LINE Messaging API 返信用関数
 */
function sendLineReply(replyToken, replyText) {
  const url = 'https://api.line.me/v2/bot/message/reply';
  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: replyText
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
}
