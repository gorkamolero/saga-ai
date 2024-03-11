import { type Orientation, createApi } from 'unsplash-js';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
  fetch: fetch,
});

/**
 * Search photos on Unsplash.
 *
 * @param {string} query - The search term.
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [perPage=10] - The number of items per page.
 * @param {string} [color] - Filter by color. Optional.
 * @param {string} [orientation] - Filter by orientation ('landscape', 'portrait', 'squarish'). Optional.
 * @returns {Promise} - A Promise that resolves to the search results.
 */
export function searchUnsplashPhotos({
  query,
  page = 1,
  perPage = 10,
  orientation = 'portrait',
}: {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: Orientation;
}) {
  return unsplash.search
    .getPhotos({
      query,
      page,
      perPage,
      orientation,
    })
    .then((result) => {
      // Handle success
      if (result.errors) {
        // Handle any errors from the API
        console.log('Error occurred: ', result.errors[0]);
      } else {
        // If successful, the response body will be contained in `result.response`
        const photos = result.response.results;
        // Process the photos as needed
        return photos;
      }
    })
    .catch((err) => {
      // Handle any errors in the request itself
      console.error('An error occurred:', err);
    });
}
