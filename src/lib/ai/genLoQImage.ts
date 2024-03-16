async function generateImage({
  prompt,
  negativePrompt,
  width,
  height,
}: {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
}): Promise<string> {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${process.env.NOVITA_API_KEY}`);
  myHeaders.append('Content-Type', 'application/json');

  const requestBody = JSON.stringify({
    extra: {
      response_image_type: 'jpeg',
      enable_nsfw_detection: true,
      nsfw_detection_level: 0,
      custom_storage: {
        aws_s3: {
          region: 'us-east-2',
          bucket: 'test_bucket',
          path: '/',
        },
      },
      enterprise_plan: {
        enabled: false,
      },
    },
    request: {
      model_name: 'anyhentai_20_31826.safetensors',
      prompt: prompt,
      negative_prompt: negativePrompt,
      sd_vae: '',
      loras: [
        {
          model_name: '',
          strength: null,
        },
      ],
      embeddings: [
        {
          model_name: '',
        },
      ],
      hires_fix: {
        target_width: null,
        target_height: null,
        strength: null,
        upscaler: 'RealESRGAN_x4plus_anime_6B',
      },
      refiner: {
        switch_at: null,
      },
      width: width,
      height: height,
      image_num: 1,
      steps: 20,
      seed: 123,
      clip_skip: 1,
      guidance_scale: 7.5,
      sampler_name: 'Euler a',
    },
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: requestBody,
    redirect: 'follow',
  };

  try {
    const response = await fetch(
      'https://api.novita.ai/v3/async/txt2img',
      requestOptions,
    );
    const result = await response.text();
    console.log(result);
    return result;
  } catch (error) {
    console.error('error', error);
    throw error; // Rethrow the error if you want to handle it outside this function
  }
}
