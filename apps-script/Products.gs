/**
 * Dream Cart BD - Products, Categories, Brands & Banners Module
 */

function fetchProductsData() {
  const sheet = getSheet(CONFIG.SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const products = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    products.push(item);
  }
  return products;
}

function fetchCategoriesData() {
  const sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const categories = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    categories.push(item);
  }
  return categories;
}

function fetchBrandsData() {
  const sheet = getSheet(CONFIG.SHEETS.BRANDS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const brands = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    brands.push(item);
  }
  return brands;
}

function fetchBannersData() {
  const sheet = getSheet(CONFIG.SHEETS.BANNERS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const banners = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    banners.push(item);
  }
  return banners;
}

function fetchReviewsData() {
  const sheet = getSheet(CONFIG.SHEETS.REVIEWS);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const reviews = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    reviews.push(item);
  }
  return reviews;
}

function fetchSettingsData() {
  const sheet = getSheet(CONFIG.SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    const val = data[i][1];
    const active = data[i][2];
    if (key) {
      settings[key] = { value: val, active: active };
    }
  }
  return settings;
}
