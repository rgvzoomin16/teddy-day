const storyGraph = {
  start: {
    text: "You meet a teddy at the moonlit garden.",
    choices: [
      { label: "Offer a warm hug", next: "hug" },
      { label: "Write a tiny poem", next: "poem" }
    ]
  },
  hug: {
    text: "The teddy blushes and gives you a key.",
    choices: [
      { label: "Open the heart gate", next: "bestEnding" },
      { label: "Explore the candy lane", next: "candy" }
    ]
  },
  poem: {
    text: "Your poem echoes in stars and unlocks a map.",
    choices: [
      { label: "Follow glowing map", next: "bestEnding" },
      { label: "Take scenic detour", next: "detour" }
    ]
  },
  candy: { text: "Sweet but slow. Dawn arrives.", choices: [] },
  detour: { text: "Beautiful path, but you miss the surprise finale.", choices: [] },
  bestEnding: { text: "💖 Best Ending: A teddy parade celebrates your love story!", choices: [] }
};

function hasCycle(graph) {
  const visiting = new Set();
  const visited = new Set();

  const dfs = (node) => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const edge of graph[node].choices) {
      if (dfs(edge.next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  };

  return Object.keys(graph).some((node) => dfs(node));
}

function bfsShortestPath(graph, start, target) {
  const queue = [[start]];
  const seen = new Set([start]);

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];
    if (node === target) return path;

    for (const edge of graph[node].choices) {
      if (!seen.has(edge.next)) {
        seen.add(edge.next);
        queue.push([...path, edge.next]);
      }
    }
  }
  return null;
}

let currentNode = "start";

function renderStory() {
  const node = storyGraph[currentNode];
  document.getElementById("story-text").textContent = node.text;
  const choiceRoot = document.getElementById("choices");
  choiceRoot.innerHTML = "";
  node.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.label;
    btn.onclick = () => {
      currentNode = choice.next;
      renderStory();
    };
    choiceRoot.appendChild(btn);
  });
  document.getElementById("story-meta").textContent = hasCycle(storyGraph)
    ? "Cycle detected in story graph."
    : "No cycles detected in story graph.";
}

const unlockGraph = {
  watchAnimation: [],
  solvePuzzle: ["watchAnimation"],
  openLetter: ["solvePuzzle"],
  surpriseGift: ["openLetter"],
  finalHug: ["surpriseGift"]
};

function topoSortKahn(graph) {
  const indegree = {};
  const adj = {};
  Object.keys(graph).forEach((node) => {
    indegree[node] = 0;
    adj[node] = [];
  });

  Object.entries(graph).forEach(([node, prereqs]) => {
    prereqs.forEach((pre) => {
      adj[pre].push(node);
      indegree[node] += 1;
    });
  });

  const q = Object.keys(indegree).filter((n) => indegree[n] === 0);
  const order = [];

  while (q.length) {
    const node = q.shift();
    order.push(node);
    for (const nxt of adj[node]) {
      indegree[nxt] -= 1;
      if (indegree[nxt] === 0) q.push(nxt);
    }
  }
  return order.length === Object.keys(graph).length ? order : [];
}

class TrieNode {
  constructor() {
    this.children = {};
    this.end = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.end = true;
  }

  searchPrefix(prefix) {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }

    const results = [];
    const dfs = (curr, path) => {
      if (results.length >= 6) return;
      if (curr.end) results.push(path);
      for (const [ch, next] of Object.entries(curr.children)) {
        dfs(next, path + ch);
      }
    };
    dfs(node, prefix.toLowerCase());
    return results;
  }
}

const quotes = [
  "forever starts with us",
  "you are my coziest home",
  "love is warm like a teddy hug",
  "every heartbeat says your name",
  "we laugh in the language of stars"
];

const trie = new Trie();
quotes.forEach((q) => trie.insert(q));

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function closestName(input, dictionary) {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  let best = { name: dictionary[0], dist: Infinity };

  for (const item of dictionary) {
    const dist = editDistance(normalized, item.toLowerCase());
    if (dist < best.dist) best = { name: item, dist };
  }

  const confidence = Math.max(0, 100 - best.dist * 20);
  return { ...best, confidence };
}

const maze = [
  ["S", ".", "#", ".", "."],
  ["#", ".", "#", ".", "#"],
  [".", ".", ".", ".", "."],
  [".", "#", "#", "#", "."],
  [".", ".", ".", "H", "."]
];

function solveMaze(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let start;
  let end;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (grid[r][c] === "S") start = [r, c];
      if (grid[r][c] === "H") end = [r, c];
    }
  }

  const queue = [start];
  const prev = new Map();
  const seen = new Set([start.join(",")]);

  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === end[0] && c === end[1]) break;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === "#") continue;
      const key = `${nr},${nc}`;
      if (seen.has(key)) continue;
      seen.add(key);
      prev.set(key, [r, c]);
      queue.push([nr, nc]);
    }
  }

  const path = [];
  let curr = end;
  while (curr) {
    path.push(curr);
    const key = curr.join(",");
    curr = prev.get(key);
  }
  path.reverse();

  if (path[0][0] !== start[0] || path[0][1] !== start[1]) {
    return "No path found";
  }

  const rendered = grid.map((row) => [...row]);
  for (const [r, c] of path) {
    if (rendered[r][c] === ".") rendered[r][c] = "*";
  }
  return rendered.map((row) => row.join(" ")).join("\n");
}

class MinHeap {
  constructor() {
    this.data = [];
  }
  push(item) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }
  pop() {
    if (!this.data.length) return null;
    const top = this.data[0];
    const end = this.data.pop();
    if (this.data.length) {
      this.data[0] = end;
      this.sinkDown(0);
    }
    return top;
  }
  peek() { return this.data[0]; }
  bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p].time >= this.data[i].time) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }
  sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let largest = i;
      const l = i * 2 + 1;
      const r = i * 2 + 2;
      if (l < n && this.data[l].time > this.data[largest].time) largest = l;
      if (r < n && this.data[r].time > this.data[largest].time) largest = r;
      if (largest === i) break;
      [this.data[largest], this.data[i]] = [this.data[i], this.data[largest]];
      i = largest;
    }
  }
}

const topK = 5;
const scoreHeap = new MinHeap();

function addScore(name, time) {
  scoreHeap.push({ name, time });
  if (scoreHeap.data.length > topK) scoreHeap.pop();
}

function leaderboardSorted() {
  return [...scoreHeap.data].sort((a, b) => a.time - b.time);
}

const moodIndex = {
  sweet: ["You are my favorite forever."],
  funny: ["Even my teddy gets jealous of your hugs."],
  emotional: ["In every lifetime, I'd still choose you."]
};

let surprises = [
  "🎁 Handwritten note unlocked!",
  "🍫 Chocolate rain bonus!",
  "🎵 Secret teddy song plays!",
  "🌟 Constellation shaped like your initials!"
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(surprises);

let achievementMask = 0;
const ALL_FOUND = 0b111;

function renderAchievements() {
  const found = achievementMask.toString(2).padStart(3, "0");
  const complete = achievementMask === ALL_FOUND
    ? "🏅 Achievement unlocked: Teddy Treasure Hunter"
    : "Keep exploring to unlock all hidden teddies!";
  document.getElementById("achievement-status").textContent = `Bitmask: ${found} — ${complete}`;
}

document.getElementById("reset-story").onclick = () => {
  currentNode = "start";
  renderStory();
};

document.getElementById("best-ending").onclick = () => {
  const path = bfsShortestPath(storyGraph, "start", "bestEnding");
  alert(path ? `Shortest path: ${path.join(" -> ")}` : "No path to best ending");
};

document.getElementById("start-unlock").onclick = () => {
  const order = topoSortKahn(unlockGraph);
  const list = document.getElementById("unlock-order");
  list.innerHTML = "";
  order.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    list.appendChild(li);
  });
};

document.getElementById("quote-prefix").addEventListener("input", (e) => {
  const prefix = e.target.value;
  const suggestions = trie.searchPrefix(prefix);
  const list = document.getElementById("quote-suggestions");
  list.innerHTML = "";
  suggestions.forEach((quote) => {
    const li = document.createElement("li");
    li.textContent = quote;
    list.appendChild(li);
  });
});

document.getElementById("name-input").addEventListener("input", (e) => {
  const result = closestName(e.target.value, ["Vinni", "Anaya", "Misha", "Riya"]);
  document.getElementById("name-suggestion").textContent = result
    ? `Did you mean ${result.name}? confidence ${result.confidence}%`
    : "";
});

document.getElementById("solve-maze").onclick = () => {
  document.getElementById("maze-output").textContent = solveMaze(maze);
};

document.getElementById("add-score").onclick = () => {
  const name = document.getElementById("score-name").value.trim() || "Anonymous";
  const time = Number(document.getElementById("score-time").value);
  if (!time) return;
  addScore(name, time);
  const board = document.getElementById("leaderboard");
  board.innerHTML = "";
  leaderboardSorted().forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} — ${entry.time}s`;
    board.appendChild(li);
  });
};

document.querySelectorAll("#assistant-section button").forEach((btn) => {
  btn.onclick = () => {
    const mood = btn.dataset.mood;
    const options = moodIndex[mood] || ["No quote found."];
    const quote = options[Math.floor(Math.random() * options.length)];
    document.getElementById("assistant-reply").textContent = quote;
  };
});

document.getElementById("draw-surprise").onclick = () => {
  const text = surprises.length ? surprises.pop() : "All surprises opened 💌";
  document.getElementById("surprise-result").textContent = text;
};

document.querySelectorAll("#achievement-section button").forEach((btn) => {
  btn.onclick = () => {
    const bit = Number(btn.dataset.item);
    achievementMask |= (1 << bit);
    renderAchievements();
  };
});

renderStory();
renderAchievements();
