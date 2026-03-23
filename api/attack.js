// api/attack.js
export default async function handler(req, res) {
    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { skillName } = req.body;
    
    // Vercel 환경 변수에서 API 키를 가져옵음 (코드에 직접 노출 안 됨!)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
    }

    try {
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
        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gemini API 호출 중 에러 발생' });
    }
}
