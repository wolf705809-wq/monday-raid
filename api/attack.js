// 파일 위치: api/attack.js

export default async function handler(req, res) {
    // 1. POST 요청만 받음
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }

    // 2. 프론트엔드에서 보낸 스킬 이름 받기
    const { skillName } = req.body;
    
    // 3. Vercel 환경 변수에서 API 키 가져오기 (코드에 노출 안 됨!)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다.' });
    }

    try {
        // 4. Gemini API 호출
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: `
                        너는 게임의 데미지 판정 심판이야. 보스는 '월요일의 악마'야.
                        플레이어가 다음 이름의 스킬을 사용했어: "${skillName}"
                        
                        이 스킬의 이름이 얼마나 창의적이고 웃긴지, 월요일 퇴치에 어울리는지 평가해서 아래 JSON 형식으로만 딱 답변해. 마크다운(\`\`\`) 쓰지마.
                        {
                            "damage": 데미지 수치 (1~3000 사이의 숫자. 어이없고 웃길수록 높게),
                            "critical": 크리티컬 여부 (true 또는 false),
                            "description": "이 스킬이 어떻게 발동되어 보스를 때렸는지 아주 오글거리고 코믹한 중계 멘트 (2문장 이내)"
                        }
                    `}]
                }]
            })
        });

        const data = await response.json();
        
        // 5. 프론트엔드로 결과 돌려주기
        res.status(200).json(data);

    } catch (error) {
        console.error("Gemini API 에러:", error);
        res.status(500).json({ error: 'Gemini 서버와 통신 중 문제가 발생했습니다.' });
    }
}
