const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateHealthPlan(userData) {
    const prompt = `
Act as a clinical nutritionist and medical AI assistant. Based on the following user details, generate a structured health plan.

User Details:
- Name: ${userData.name}
- Age: ${userData.age}
- Height: ${userData.height} cm
- Weight: ${userData.weight} kg
- Gender: ${userData.gender}
- Medical Conditions: ${userData.medicalConditions.join(', ') || 'None'}
- Diet Type: ${userData.dietType}
- Allergies: ${userData.allergies.join(', ') || 'None'}

Return ONLY a valid JSON object with this exact structure:
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
      "dosage": "500mg",
      "timing": "After Breakfast",
      "instructions": "Additional instructions",
      "alternate": "Alternative if applicable"
    }
  ],
  "lifestyleSuggestions": [
    {
      "title": "Suggestion title",
      "description": "Detailed description",
      "category": "Exercise|Sleep|Stress Management|Other"
    }
  ],
  "dailyTasks": [
    {
      "title": "Task title",
      "category": "Medication|Diet|Exercise|Habit",
      "scheduledTime": "08:00",
      "priority": "High|Medium|Low"
    }
  ]
}

Important considerations:
- Make recommendations specific to the user's medical conditions
- Ensure dietary suggestions accommodate their diet type and allergies
- Provide practical, actionable daily tasks
- Include both medication and lifestyle recommendations
- Consider their age, weight, and gender in recommendations
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate health plan');
    }
  }
}

module.exports = new AIService();