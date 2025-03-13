import OpenAI from 'openai';

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface BibleStudy {
  title: string;
  keyScriptures: string[];
  introduction: string;
  mainPoints: {
    title: string;
    content: {
      overview: string;
      keyPoints: string[];
      application: string;
    };
    scripture: {
      reference: string;
      text: string;
    };
    questions: string[];
    weekNumber?: number;
    weekTitle?: string;
    weekFocus?: string;
  }[];
  application: {
    reflection: string;
    action: string;
  };
}

export async function generateBibleStudy(
  source: string,
  content: string,
  audience: string,
  theme?: string,
  weeks?: number,
  format: 'discussion' | 'teacher' = 'teacher'
): Promise<BibleStudy> {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please check your environment variables.');
  }

  try {
    console.log('Generating Bible study with:', { source, audience, theme, weeks, format });
    
    const isTeacherLed = format === 'teacher';

    // Helper function to get audience-specific guidelines
    const getAudienceGuidelines = (audience: string) => {
      const lowercaseAudience = audience.toLowerCase();
      
      // Age-based audiences
      if (lowercaseAudience.includes('year') || lowercaseAudience.includes('age')) {
        const age = parseInt(audience);
        if (!isNaN(age)) {
          if (age <= 5) {
            return `
              - Use very simple words and short sentences
              - Focus on basic concepts like "God loves you" and "Jesus is our friend"
              - Include concrete examples from daily life (family, toys, pets)
              - Keep questions very simple and direct
              - Use lots of repetition
              - Limit abstract concepts
              - Keep sessions short and interactive
            `;
          } else if (age <= 12) {
            return `
              - Use clear, simple language
              - Include stories and examples they can relate to
              - Connect lessons to family, school, and friends
              - Mix in activities and interactive elements
              - Use concrete examples before abstract concepts
              - Keep theological terms simple
            `;
          } else if (age <= 18) {
            return `
              - Address real-world issues and challenges
              - Include relevant cultural references
              - Connect scripture to current events
              - Challenge them to think critically
              - Address doubts and questions openly
              - Use examples from school, relationships, and social media
            `;
          }
        }
      }

      // Life stage audiences
      if (lowercaseAudience.includes('college') || lowercaseAudience.includes('university')) {
        return `
          - Address intellectual and philosophical questions
          - Include academic and cultural references
          - Connect faith with career and life choices
          - Address common challenges to faith
          - Include social justice and ethical discussions
          - Use examples from campus life and young adult experiences
        `;
      }

      if (lowercaseAudience.includes('married') || lowercaseAudience.includes('couple')) {
        return `
          - Focus on relationship dynamics and growth
          - Include practical examples from marriage
          - Address common marital challenges
          - Include discussion questions for couples
          - Use examples about communication, conflict resolution
          - Connect scripture to family life
        `;
      }

      if (lowercaseAudience.includes('parent') || lowercaseAudience.includes('family')) {
        return `
          - Focus on family dynamics and parenting challenges
          - Include practical parenting applications
          - Address work-life balance
          - Use examples from family situations
          - Include discussion about children's faith development
          - Connect scripture to family leadership
        `;
      }

      if (lowercaseAudience.includes('senior') || lowercaseAudience.includes('elder')) {
        return `
          - Use larger font and clear language
          - Include life wisdom and reflection
          - Address legacy and life purpose
          - Connect scripture to life experience
          - Include examples from different life stages
          - Focus on passing faith to next generations
        `;
      }

      // Default adult audience
      return `
        - Use balanced, accessible language
        - Include real-life applications
        - Mix intellectual and practical insights
        - Address both personal and community aspects
        - Use diverse examples and scenarios
        - Balance theological depth with practical application
      `;
    };

    const audienceGuidelines = getAudienceGuidelines(audience);
    
    const prompt = `Create an engaging ${weeks ? `${weeks}-week` : ''} Bible study for ${audience}${
      theme ? ` focused on ${theme}` : ''
    } based on the following ${source}: "${content}"

    This should be a ${isTeacherLed ? 'teacher-led' : 'discussion-based'} study ${weeks ? `that breaks down the topic into ${weeks} distinct but related sessions` : ''}.

    CRITICAL - Audience Adaptation Guidelines:
    ${audienceGuidelines}

    ${weeks ? `Each week should provide enough material for a rich 45-minute ${isTeacherLed ? 'lesson with discussion' : 'group discussion'}.

    For each week, include:
    - A clear weekly focus or theme that builds on previous weeks
    - Key scripture passages with full text
    ${isTeacherLed ? `- 3-4 substantial teaching points that dive deep into the meaning
    - 4-5 discussion questions to reinforce the teaching
    - Practical application steps` : `- A brief overview to set context
    - 6-8 engaging discussion questions that guide discovery
    - Key points to emphasize during discussion
    - Practical next steps`}

    Make each week build upon previous weeks while remaining independently valuable.` : `Create a comprehensive lesson designed to facilitate a rich 45-minute ${isTeacherLed ? 'teaching session with discussion' : 'group discussion'}.`}

    Format the response as a JSON object with the following structure:
    {
      "title": "An engaging, descriptive title for the study",
      "keyScriptures": ["2-3 key Bible verses with full text (e.g., 'John 3:16 - For God so loved the world...')"],
      "introduction": "${isTeacherLed ? 'A thorough overview (3-4 paragraphs)' : 'A concise overview (1-2 paragraphs)'} explaining the study's purpose, relevance, and what participants will learn",
      "mainPoints": [
        {
          "title": "Clear, engaging section heading",
          "content": {
            "overview": "${isTeacherLed ? 'A substantial paragraph' : 'A brief paragraph'} introducing this section's focus",
            "keyPoints": [
              ${isTeacherLed ? `"3-4 detailed teaching points, each 2-3 sentences long",
              "Include theological insights and practical examples",
              "Make points clear, deep, and immediately applicable"` : `"3-4 key points to emphasize during discussion",
              "Brief points that guide without overwhelming",
              "Focus on discovery through discussion"`}
            ],
            "application": "${isTeacherLed ? 'Multiple specific ways' : 'A clear way'} this truth can transform daily life"
          },
          "scripture": {
            "reference": "Primary scripture reference",
            "text": "Full text of the scripture verse"
          },
          "questions": [
            ${isTeacherLed ? `"4-5 discussion questions that progress from:",
            "1. Understanding the text",
            "2. Exploring the meaning",
            "3. Personal implications",
            "4. Practical application"` : `"6-8 discussion questions that:",
            "1. Open with observation",
            "2. Guide through interpretation",
            "3. Encourage personal discovery",
            "4. Lead to practical application",
            "5. Challenge group interaction"`}
          ]${weeks ? `,
          "weekNumber": "Week number (1-${weeks})",
          "weekTitle": "Compelling title for this week's session",
          "weekFocus": "Clear statement of this week's specific focus"` : ''}
        }
      ],
      "application": {
        "reflection": "A thought-provoking question that helps participants integrate all they've learned",
        "action": "Clear, specific steps for putting these truths into practice"
      }
    }

    Guidelines for creating ${isTeacherLed ? 'teacher-led' : 'discussion-based'} content:
    1. Always include the full text of scripture references
    ${isTeacherLed ? `2. Make teaching points substantial - each should be 2-3 sentences that include:
       - Clear explanation of the truth
       - Why it matters
       - How it connects to life
    3. Create discussion questions that:
       - Reinforce the teaching points
       - Check for understanding
       - Guide application` : `2. Keep teaching points brief - they should:
       - Guide discussion without lecturing
       - Highlight key discoveries
       - Emphasize main takeaways
    3. Create discussion questions that:
       - Encourage group interaction
       - Guide discovery learning
       - Build on each other`}
    4. Include specific, actionable applications that:
       - Connect to real-life situations
       - Are measurable and achievable
       - Lead to spiritual growth
    5. Write in a way that's:
       - Perfectly adapted for ${audience}
       - Clear and engaging
       - Focused on transformation`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert in creating engaging Bible Studies that combine ${isTeacherLed ? 'deep theological insight with practical application' : 'meaningful discussion with personal discovery'}. 
          
          Your specialty is adapting content perfectly for specific audiences while maintaining biblical truth. You have extensive experience teaching ${audience} and understand their unique:
          - Learning style
          - Vocabulary level
          - Life experiences
          - Spiritual maturity
          - Cultural context
          - Practical needs
          
          Create content that ${isTeacherLed ? 'teaches truth effectively while encouraging discussion' : 'facilitates group learning through guided discussion'}. ${isTeacherLed ? 'Write with the theological depth of John MacArthur and the engaging style of Max Lucado.' : 'Write with the discussion facilitation style of Henry Cloud and the engaging questions of Rick Warren.'}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log('Received response from OpenAI');
    
    if (!completion.choices[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    const responseContent = completion.choices[0].message.content;
    console.log('Parsing OpenAI response...');
    
    try {
      const parsedContent = JSON.parse(responseContent) as BibleStudy;
      console.log('Successfully parsed Bible study content');
      return parsedContent;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseContent);
      throw new Error('Failed to parse Bible study content. The response was not in the expected format.');
    }
  } catch (error: any) {
    console.error('OpenAI error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });

    if (error.name === 'APIError') {
      switch (error.status) {
        case 401:
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        case 429:
          throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('OpenAI service is currently experiencing issues. Please try again later.');
        default:
          throw new Error(error.message || 'An error occurred while communicating with OpenAI');
      }
    }
    
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to generate Bible study content');
    }
    
    throw new Error('An unexpected error occurred while generating the Bible study');
  }
}