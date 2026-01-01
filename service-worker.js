

const CACHE_NAME = "my-vibe-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

const STORAGE_KEY = "simple_todo_v1";
const TAGS_KEY = "simple_todo_tags_v1"; // ★追加

let todos = load();
let tags = loadTags();                 // ★追加
let selectedTags = new Set();          // ★追加

const $input = document.getElementById("input");
const $addBtn = document.getElementById("addBtn");
const $list = document.getElementById("list");
const $count = document.getElementById("count");
const $empty = document.getElementById("empty");
const $clearDone = document.getElementById("clearDone");

// ★追加（タグUI）
const $tagChips = document.getElementById("tagChips");
const $newTagInput = document.getElementById("newTagInput");
const $createTagBtn = document.getElementById("createTagBtn");

function loadTags(){
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTags(){
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

function renderTags(){
  $tagChips.innerHTML = "";

  // タグが0ならガイド表示（任意）
  if (tags.length === 0){
    const hint = document.createElement("div");
    hint.className = "meta";
    hint.textContent = "まだタグがないよ。下で作ってみて。";
    $tagChips.appendChild(hint);
    return;
  }

  for (const tag of tags){
    const chip = document.createElement("div");
    chip.className = "tag-chip" + (selectedTags.has(tag) ? " active" : "");
    chip.textContent = `#${tag}`;

    chip.addEventListener("click", () => {
      if (selectedTags.has(tag)) selectedTags.delete(tag);
      else selectedTags.add(tag);
      renderTags();
    });

    $tagChips.appendChild(chip);
  }
}

function normalizeTag(s){
  return s.trim().replace(/^#/, "");
}

function createTag(raw){
  const t = normalizeTag(raw);
  if (!t) return;

  // 重複防止（大文字小文字はそのままにしたいならここは簡易でOK）
  if (!tags.includes(t)){
    tags.unshift(t);        // 先頭に追加
    saveTags();
  }

  // 作ったタグは自動で選択状態にする
  selectedTags.add(t);

  $newTagInput.value = "";
  renderTags();
}


const text = document.createElement("div");
text.className = "todo-text";
text.textContent = t.text;

// ★タグ表示
if (t.tags && t.tags.length){
  const tagLine = document.createElement("div");
  tagLine.className = "meta";
  tagLine.textContent = t.tags.map(x => `#${x}`).join("  ");
  text.appendChild(tagLine);
}

$createTagBtn.addEventListener("click", () => createTag($newTagInput.value));
$newTagInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") createTag($newTagInput.value);
});

render();
renderTags();



