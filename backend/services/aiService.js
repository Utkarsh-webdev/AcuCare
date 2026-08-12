// backend/services/aiService.js

const { GoogleGenAI } = require('@google/genai');

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    async generateHealthPlan(userData) {
        const medicalConditions = Array.isArray(userData.medicalConditions)
            ? userData.medicalConditions.join(', ')
            : userData.medicalConditions || 'None';

        const allergies = Array.isArray(userData.allergies)
            ? userData.allergies.join(', ')
            : userData.allergies || 'None';

        const medications = Array.isArray(userData.medications)
            ? userData.medications
            : [];

        const prompt = `
Act as a clinical nutritionist and medical health assistant.

Generate a structured, personalized health and lifestyle plan based on user information below.

USER DETAILS:

Name: ${userData.name || 'Not provided'}
Age: ${userData.age || 'Not provided'}
Height: ${userData.height || 'Not provided'} cm
Weight: ${userData.weight || 'Not provided'} kg
Gender: ${userData.gender || 'Not provided'}
Medical Conditions: ${medicalConditions}
Diet Type: ${userData.dietType || 'Not specified'}
Allergies: ${allergies}

CURRENT MEDICATIONS PROVIDED BY USER:
${medications.length > 0 ? JSON.stringify(medications) : 'None'}

IMPORTANT MEDICAL SAFETY RULES:

1. NEVER invent medications.
2. NEVER prescribe medications.
3. NEVER change medication dosage.
4. NEVER recommend a medication that user did not provide.
5. Only include medications explicitly provided in CURRENT MEDICATIONS.
6. If no medications are provided, medicationSchedule MUST be an empty array.
7. Do not create alternate medicines.
8. Do not diagnose diseases.
9. Provide general educational health guidance.
10. Encourage consultation with qualified doctor for medical decisions.
11. Dietary recommendations must respect allergies and diet type.
12. Recommendations should consider age, weight, gender, and medical conditions.
13. Avoid unsafe or extreme diets.
14. Do not make claims that a food or lifestyle change can cure a medical condition.

Return ONLY valid JSON.

Return JSON with EXACTLY this structure:

{
    "dietaryPlan": {
        "breakfast": ["meal1", "meal2"],
        "lunch": ["meal1", "meal2"],
        "dinner": ["meal1", "meal2"],
        "snacks": ["snack1", "snack2"],
        "restrictions": ["restriction1", "restriction2"],
        "fluidIntake": {
            "recommended": "2.5-3 liters daily",
            "details": "Specific hydration recommendations"
        }
    },
    "medicationSchedule": [
        {
            "medicineName": "Medicine name",
            "dosage": "Dosage provided by user",
            "timing": "Timing provided by user",
            "instructions": "Additional instructions",
            "alternate": ""
        }
    ],
    "lifestyleSuggestions": [
        {
            "title": "Suggestion title",
            "description": "Detailed description",
            "category": "Exercise"
        }
    ],
    "dailyTasks": [
        {
            "title": "Task title",
            "category": "Medication",
            "scheduledTime": "08:00",
            "priority": "High"
        }
    ]
}

VALID lifestyle categories:
Exercise
Sleep
Stress Management
Other

VALID daily task categories:
Medication
Diet
Exercise
Habit

VALID priorities:
High
Medium
Low

Medication rule:
If CURRENT MEDICATIONS PROVIDED BY USER is None, return:

"medicationSchedule": []

Do not add fictional medicines.
`;

        try {
            const result = await this.ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json'
                }
            });

            const responseText = result.text;

            if (!responseText) {
                throw new Error('Empty response received from Gemini');
            }

            let parsed;

            try {
                parsed = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Gemini JSON Parse Error:', parseError);
                console.error('Gemini Response:', responseText);

                throw new Error('Gemini returned invalid JSON');
            }

            if (!parsed.dietaryPlan) {
                parsed.dietaryPlan = {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: [],
                    restrictions: [],
                    fluidIntake: {
                        recommended: '',
                        details: ''
                    }
                };
            }

            if (!Array.isArray(parsed.medicationSchedule)) {
                parsed.medicationSchedule = [];
            }

            if (!Array.isArray(parsed.lifestyleSuggestions)) {
                parsed.lifestyleSuggestions = [];
            }

            if (!Array.isArray(parsed.dailyTasks)) {
                parsed.dailyTasks = [];
            }

            return parsed;

        } catch (error) {
            console.error('AI Service Error:', error);

            throw new Error(
                'Failed to generate health plan: ' + error.message
            );
        }
    }
}

module.exports = new AIService();