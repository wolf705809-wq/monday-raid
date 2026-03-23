module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }

    const { skillName } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API 키가 없습니다.' });
    }

    try {
        // 🌟 변경된 부분: 모델 이름을 gemini-1.5-flash-latest 로 변경했습니다!
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `당신은 귀엽고 코믹한 게임의 판정관입니다. 보스 '월요일의 꼬마 악마'에게 플레이어가 스킬을 썼습니다: "${skillName}"
                        이 스킬의 어처구니없음을 평가해서 반드시 아래 JSON 형식으로만 딱 답변하세요. 절대 다른 인사말이나 마크다운을 쓰지 마세요.
                        {"damage": 데미지숫자(1~3000), "critical": true또는false, "description": "귀엽고 뽀짝한 중계 멘트"}`
                    }]
                }]
            })
        });

        const data = await response.json();

        // 구글에서 에러를 뱉었을 경우
        if (data.error) {
            console.error("Gemini 에러:", data.error);
            return res.status(500).json({ error: 'Gemini 통신 에러' });
        }

        // AI가 잡담을 섞어 보내도 정규식으로 '{ }' 안의 JSON만 쏙 빼냅니다!
        let text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("JSON 데이터를 찾을 수 없습니다.");
        }

        // 파싱된 깔끔한 데이터 객체
        const parsedData = JSON.parse(jsonMatch[0]);

        // 프론트엔드로는 깨끗한 객체만 딱 전송
        res.status(200).json(parsedData);

    } catch (error) {
        console.error("서버 파싱 에러:", error);
        res.status(500).json({ error: '서버 데이터 처리 에러' });
    }
};
