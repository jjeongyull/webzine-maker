async function load_structure() {
  let response = await fetch(SERVER_URL + "/structure.json");
  let jsonData = await response.json();
  console.log(jsonData);
  g_option = jsonData;
}
async function load_main() {
  let response = await fetch(SERVER_URL + "/main.json");
  let jsonData = await response.json();
  console.log(jsonData);
  g_main_list = jsonData;
}
async function load_category() {
  let response = await fetch(SERVER_URL + "/category.json");
  let jsonData = await response.json();
  console.log(jsonData);
  g_category_list = jsonData;
}
async function load_sub() {
  let response = await fetch(SERVER_URL + "/sub.json");
  let jsonData = await response.json();
  console.log(jsonData);
  g_content_list = jsonData;
}