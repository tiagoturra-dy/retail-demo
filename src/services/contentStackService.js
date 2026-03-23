const config = {
  API_KEY: "blt7059d89c7bd4a5bb",
  ACCESS_TOKEN: "csd19b933e28af6dfdb52cd2a7",
}

const getMockContent = (contentType) => {
  // Mock response for a banner_block
  if (contentType === 'banner_block') {
    return {
      display_title: 'THE NEW STANDARD OF LUXURY',
      subtitle: 'Discover our latest arrivals and timeless classics.',
      background_image: {
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920'
      },
      cta_text: 'Explore Now',
      link_url: '/category/all',
    };
  }
}

export const contentStackService = {
  getContent: async (contentType, entryId) => {
    console.log(`Fetching ContentStack entry: ${contentType}/${entryId}`);

    let url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/${entryId}?environment=production`
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'api_key': config.API_KEY,
        'access_token': config.ACCESS_TOKEN
      }
    };

    var content = {};

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      content = data?.entry;
      console.log(`Contentstack content for ${contentType}:`, content)

    } catch (e) {
      console.error(`Error in getting CONTENTSTACK content`, e);
      console.error(`Adding fallback mocked content`);
      content = getMockContent(contentType)
    }
    return content;
  },
  getMultipleContent: async (contentType, entryIdList) => {
    console.log(`Fetching ContentStack entry: ${contentType}/${entryIdList.join('","')}`);

    let url = `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/?environment=production&query={"uid": {"$in" : ["${entryIdList.join('","')}"]}}`

    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'api_key': config.API_KEY,
        'access_token': config.ACCESS_TOKEN
      }
    };

    var content = {};

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      content = data?.entries;

      //get the entries back in the original order
      content.sort((a, b) => entryIdList.indexOf(a['uid']) - entryIdList.indexOf(b['uid']));
      console.log(`Contentstack content for ${contentType}:`, content)

    } catch (e) {
      console.error(`Error in getting CONTENTSTACK content`, e);
      console.error(`Adding fallback mocked content`);
      content = getMockContent([contentType])
    }
    return content;
  }
};
