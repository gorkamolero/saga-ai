import { z } from 'zod';

export const generateImageWithLemonfoxSchema = z.object({
  description: z.string(),
  retryCount: z.number().optional(),
});

export const generateImageWithLemonfox = async ({
  description,
  retryCount = 0,
}: z.infer<typeof generateImageWithLemonfoxSchema>): Promise<string> => {
  try {
    const response = await fetch(
      'https://api.lemonfox.ai/v1/images/generations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          negative_prompt: 'NEVER USE TEXT',
          size: '576x1024',
        }),
      },
    );
    const json = await response.json();
    const { data } = json;

    if (!data || (data.length === 0 && json.error)) {
      throw { ...json.error, status: json.status };
    }

    const url: string = data[0].url;

    return url;
  } catch (error) {
    if (retryCount < 3) {
      return generateImageWithLemonfox({
        description,
        retryCount: retryCount + 1,
      });
    }
    throw error;
  }
};
