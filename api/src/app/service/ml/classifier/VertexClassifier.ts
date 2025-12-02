import AbstractClassifyHandler from './AbstractClassifyHandler';
import { GenerateContentResult, GenerativeModelPreview, VertexAI } from '@google-cloud/vertexai';
import { HarmBlockThreshold, HarmCategory } from '@google-cloud/vertexai';
import { injectable } from '../../../boot';


@injectable()
export class VertexClassifier extends AbstractClassifyHandler {
  private generativeModel: GenerativeModelPreview;

  constructor() {
    super();
    const vertexAi = new VertexAI({
      project: 'autouw-261707',
      location: 'us-central1',
      googleAuthOptions: {
        credentials: {
          private_key:
          // eslint-disable-next-line max-len
            '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVRTIzOhdCujMU\n8ELvAMedlqOGOxtXr1dJQsQieNGxo0ARZMp3lw2EmBUlEFakXcXG9KwmLSmtyOUD\nmdljGMiiRlobep6Xi7F4hrpB0uO/kxCs2SPkSMtroPjN8JgdUjqXp7KYQRggZfjP\ncmgh8GdqHSi457zu8rgkZ6iXWNCE7ffrqw0WlUliedFXw1y+aBa1RrWt+AimcRxE\nmX+o5od8oMVCHQIanZXP/jAarnfrUTeZNRAjqWtzZt3z7Ok1bfzmQiVnpMp0tayv\nYdkVn3py4ZlY9IRZO9L06PuOZEDQOYsPW6ngOM7DQPBCUBIcYW9HspvnRhmLzoq9\nLpWTUQiVAgMBAAECggEAIgUAdSjc4sYNfMzqME7g76NElwPTDjelwMpg6YtYHTBb\n2mr6cul/+PNxRD52RKUjfV3HezbpTBRgT2MJpppgJY27nQ4j5V1+v72S5wwRgFib\n4Qzm73EAvYGVGthlzq7uMCCV5TnWrhGXdG36WhvQceB95rBYAKxcN93REFc7RMQf\nJ1FfLksK5hsN//fHWFXEmdvsBhrYcKY7br+iGhS0u3SFCeSsRA5O/a8LAZ0USuoN\nypoBzBn3YAR8UUNgb6HIlQAj3VkpPcJQCs7svkyENfXRN2qhrwRuHKrymaebHkt/\nF88XfHDX59c8w81pgJSYiDPYsISgJ7XehfXKsEDrkQKBgQDQS4N5qgV98NIaEjWw\nQx1MLNHM2gicd8sRdhoXbsTwL2BB2U4oDqH/oBBFvSCWUHgQauAjmfYLxBH4SSd/\nICRUyFWX38M+NcWbIKTVTEqlQ+ztJGsiudRM1vjq08IWRAZkVmNcWPJ7xQ4j1UMJ\nnrIUXQjVDL4+/EZcQr1o2ukTxQKBgQC3dQXH9C7MhocPHZZ+yAyso7mpj6qh5Kvp\nPT5V1BPJ0VVUUNj+4C1b54pBKnJwMEXrz7Qj1RatG85BmnoKPA20DLiBuv2ZcdQN\nnQiDcSTm5cLQql+VvcpxPl500m/MDPikp3VxIYMEkE5XBQhQiGDbya0Oekl0U4jh\nWWD8+AjekQKBgFVtAujc4A+8uo5StY4qmFNrdkfri+iQAMqSgzTlCwPuii23b6Ri\nC/KItOPFIx5CtlsVWgN/2zcMHMqVRguPJRdYajI1ZR+YcgijJLcN6PdKmlrPutit\nGfLBn6i/XDRBhdWU0H9JQ3mbYac0iZ/iY+qSFVM7PLMcR8cC4Cem0Dx5AoGANxwR\nM4K3uDrFQZYqykUAAbBhKn18zYsq1TLPkerWUu7uShjLRq1DEvOYBYFhxS/LIU5Q\nl98AI9pReEWWWZK2rxqPJnFskvats7UzhICtjCsC/bngYtQThzcsGr3IVayj2Jpx\nXh2qBOnwjpV1bPO63OtVcB7uB+K8IK2/w94ik/ECgYB6Zozg9UeQRgUCtIlywnWn\nr1tiTjddHTXy3jyV5hWVUrMS9e90ULtBqYdIJXLFRWdcWn3e4e0HFVg89fmdHV7j\nab6uZDIOlU+fjcC4uOPyVFQLe5ZPiTCrMMn3M1Rh3YJgFZOxaYOHP7aQ0KJWoRVZ\ni9wkJGyQI36Lioqqtzzd2A==\n-----END PRIVATE KEY-----\n',
          client_email: '895928009635-compute@developer.gserviceaccount.com',
        },
      },
    });
    const model = 'gemini-1.5-pro-preview-0514';
    this.generativeModel = vertexAi.preview.getGenerativeModel({
      model: model,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.0,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  async classifyLineItems(prompt: string): Promise<string> {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const response: GenerateContentResult = await this.generativeModel.generateContent(request);
    return response.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
}

