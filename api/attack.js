// 파일 위치: api/attack.js

// 1. node-fetch 라이브러리를 사용해서 더 안정적으로 API를 호출합니다.
const fetch = require('node-fetch');

// 2. module.exports 방식을 사용하여 CommonJS 환경과의 호환성을 극대화합니다.
module.exports = async function handler(req, res) {
    // POST 요청만 받음
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }

    const { skillName } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    // 3. API 키가 없는 경우에 대한 상세한 서버 로그를 남깁니다.
    if (!GEMINI_API_KEY) {
        console.error("[ERORR] GEMINI_API_KEY is missing in environment variables!");
        return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
    }

    try {
        // 4. Gemini API 호출
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 코믹한 게임 데미지 판정관입니다. 월요일의 악마라는 보스 몬스터에게 플레이어가 다음 스킬을 사용했습니다: "${skillName}"

        이 스킬의 어처구니없음, 창의성, 웃김을 기준으로 보스에게 입힌 피해량(1~3000 사이 숫자), 크리티컬 여부(true/false), 그리고 아주 오글거리고 코믹한 중계 멘트(2문장 이내)를 포함하는 JSON 형식으로 답변하세요. 마크다운(\`\`\`) 형식은 사용하지 마세요.

        {
          "damage": 데미지수치,
          "critical": true또는false,
          "description": "중계멘트"
        }`
                    }]
                }]
            })
        });

        const data = await response.json();

        // 5. 만약 구글 API에서 에러를 반환했다면 상세한 로그를 남깁니다.
        if (data.error) {
            console.error("[ERROR] Gemini API Error:", JSON.stringify(data.error));
            return res.status(data.error.code || 500).json(data.error);
        }

        // 6. 정상적인 결과 반환
        res.status(200).json(data);

    } catch (error) {
        // 7. 서버에서 발생한 알 수 없는 에러 로그를 남깁니다.
        console.error("[ERROR] Backend Runtime Error:", error);
        res.status(500).json({ error: '서버에서 알 수 없는 에러가 발생했습니다.' });
    }
};
