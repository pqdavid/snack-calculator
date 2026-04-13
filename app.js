// 小廢物清算機 JavaScript
class SnackCalculator {
  constructor() {
    this.amount = 0;
    this.selectedPrices = new Set([21, 23, 32, 33, 34, 35, 41]);
    this.mode = "max-variety";
    this.presetPrices = [17, 18, 21, 23, 24, 25, 27, 32, 33, 34, 35, 41, 53];
    this.customPrices = [];

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderPricePills();
    this.renderSelectedBoard();
  }

  setupEventListeners() {
    // 金額輸入
    document.getElementById("amount").addEventListener("input", (e) => {
      this.amount = parseInt(e.target.value) || 0;
    });

    // 快速查詢按鈕
    document.getElementById("quick-query").addEventListener("click", () => {
      window.open("https://pay.yallvend.com/app/point_check/point_check?key=54897e8885489ca705c9dc4cd36abeffd22bfa86b69e7fd80ee902576d9b9ea5&country=tw", "_blank");
    });

    // 計算按鈕
    document.getElementById("calc").addEventListener("click", () => {
      this.updateResultsWithLoading();
    });

    // 模式切換
    document.getElementById("mode-max-variety").addEventListener("click", () => {
      this.setMode("max-variety");
    });

    document.getElementById("mode-min-left").addEventListener("click", () => {
      this.setMode("min-left");
    });

    document.getElementById("mode-max-types").addEventListener("click", () => {
      this.setMode("max-types");
    });

    // 手動新增
    document.getElementById("add-price").addEventListener("click", () => {
      this.addCustomPrice();
    });

    document.getElementById("custom-price").addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.addCustomPrice();
    });
  }

  addCustomPrice() {
    const input = document.getElementById("custom-price");
    const price = parseInt(input.value);
    if (!price || price <= 0 || price > 9999) return;

    const allPrices = [...this.presetPrices, ...this.customPrices];
    if (!allPrices.includes(price)) {
      this.customPrices.push(price);
    }
    this.selectedPrices.add(price);
    input.value = "";

    this.renderPricePills();
    this.renderSelectedBoard();
  }

  togglePrice(price) {
    if (this.selectedPrices.has(price)) {
      this.selectedPrices.delete(price);
    } else {
      this.selectedPrices.add(price);
    }
    this.renderPricePills();
    this.renderSelectedBoard();
  }

  setMode(mode) {
    this.mode = mode;

    const modes = ["max-variety", "min-left", "max-types"];
    modes.forEach(m => {
      const btn = document.getElementById(`mode-${m}`);
      if (btn) {
        btn.classList.toggle("is-active", mode === m);
        btn.setAttribute("aria-selected", mode === m);
      }
    });

    this.updateResults();
  }

  showPanelWithLoading() {
    const panel = document.querySelector(".panel");
    const loading = document.getElementById("loading");
    const results = document.getElementById("panel-results");

    // 顯示 loading，隱藏結果
    if (loading) loading.style.display = "flex";
    if (results) results.classList.remove("is-visible");

    // 面板從下往上滑入
    if (panel) {
      panel.style.display = "flex";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          panel.classList.add("is-visible");
        });
      });
    }
  }

  showResults() {
    const loading = document.getElementById("loading");
    const results = document.getElementById("panel-results");

    if (loading) loading.style.display = "none";

    // 結果淡入
    if (results) {
      requestAnimationFrame(() => {
        results.classList.add("is-visible");
      });
    }
  }

  renderPricePills() {
    const container = document.getElementById("price-pills");
    container.innerHTML = "";

    const allPrices = [...this.presetPrices, ...this.customPrices]
      .sort((a, b) => a - b)
      .filter(price => !this.selectedPrices.has(price));

    allPrices.forEach(price => {
      const pill = document.createElement("button");
      pill.className = "price-pill";
      pill.type = "button";
      pill.setAttribute("aria-pressed", "false");

      const numEl = document.createElement("span");
      numEl.className = "pill-num";
      numEl.textContent = price;

      const unitEl = document.createElement("span");
      unitEl.className = "pill-unit";
      unitEl.textContent = "元";

      const addIcon = document.createElement("span");
      addIcon.className = "pill-icon--add";
      addIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 1v12M1 7h12" stroke="#3a3a3a" stroke-width="1.5" stroke-linecap="round"/></svg>`;

      const removeIcon = document.createElement("span");
      removeIcon.className = "pill-icon--remove";
      removeIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 7h12" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/></svg>`;

      pill.appendChild(numEl);
      pill.appendChild(unitEl);
      pill.appendChild(addIcon);
      pill.appendChild(removeIcon);
      // 藥丸只允許新增（刪除改由「你選取了」區塊的 × 操作）
      pill.addEventListener("click", () => {
        if (!this.selectedPrices.has(price)) this.togglePrice(price);
      });
      container.appendChild(pill);
    });
  }

  renderSelectedBoard() {
    const container = document.getElementById("selected-list");
    container.innerHTML = "";

    const selected = [...this.selectedPrices].sort((a, b) => b - a);

    selected.forEach(price => {
      const box = document.createElement("div");
      box.className = "big-price-box";

      const val = document.createElement("span");
      val.className = "big-price-val";
      val.textContent = price;

      const unit = document.createElement("span");
      unit.className = "big-price-unit";
      unit.textContent = "元";

      const removeBtn = document.createElement("div");
      removeBtn.className = "big-price-remove";
      removeBtn.setAttribute("aria-label", `移除 ${price} 元`);
      removeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M11 1L1 11" stroke="#7a7a7a" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.togglePrice(price);
      });

      box.appendChild(val);
      box.appendChild(unit);
      box.appendChild(removeBtn);
      container.appendChild(box);
    });
  }

  calculateOptimalPurchase() {
    if (this.amount <= 0 || this.selectedPrices.size === 0) {
      return { items: [], remaining: this.amount };
    }

    const prices = Array.from(this.selectedPrices).sort((a, b) => a - b);
    let remaining = this.amount;
    const items = [];

    if (this.mode === "max-variety") {
      // 買最多樣：優先買便宜的，同一種買最多
      for (const price of prices) {
        const qty = Math.floor(remaining / price);
        if (qty > 0) {
          items.push({ price, quantity: qty });
          remaining -= price * qty;
        }
      }
    } else if (this.mode === "min-left") {
      // 剩餘最少錢：優先買貴的
      for (let i = prices.length - 1; i >= 0; i--) {
        const price = prices[i];
        const qty = Math.floor(remaining / price);
        if (qty > 0) {
          items.push({ price, quantity: qty });
          remaining -= price * qty;
        }
      }
    } else if (this.mode === "max-types") {
      // 買最多種：每種各買1個（由便宜到貴），買最多不同種類
      for (const price of prices) {
        if (remaining >= price) {
          items.push({ price, quantity: 1 });
          remaining -= price;
        }
      }
      // 剩餘金額補買最便宜的
      if (remaining > 0 && items.length > 0) {
        const cheapest = items[0];
        const extra = Math.floor(remaining / cheapest.price);
        if (extra > 0) {
          cheapest.quantity += extra;
          remaining -= extra * cheapest.price;
        }
      }
    }

    return { items, remaining };
  }

  updateResults() {
    const result = this.calculateOptimalPurchase();
    this.renderResults(result.items);
    this.updateRemaining(result.remaining);
  }

  async updateResultsWithLoading() {
    this.showPanelWithLoading();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = this.calculateOptimalPurchase();
    this.renderResults(result.items);
    this.updateRemaining(result.remaining);

    this.showResults();
  }

  renderResults(items) {
    const container = document.getElementById("result-list");
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML = "<div class=\"no-results\" role=\"status\">無法購買任何品項</div>";
      return;
    }

    items.forEach((item, index) => {
      if (index > 0) {
        const separator = document.createElement("div");
        separator.className = "multiplier separator";
        separator.textContent = "＋";
        container.appendChild(separator);
      }

      const unit = document.createElement("div");
      unit.className = "unit";

      const priceBox = document.createElement("div");
      priceBox.className = "price-box";

      const priceVal = document.createElement("div");
      priceVal.className = "price-val";
      priceVal.textContent = item.price;

      const priceUnit = document.createElement("div");
      priceUnit.className = "price-unit";
      priceUnit.textContent = "元";

      const multiplier = document.createElement("div");
      multiplier.className = "multiplier";
      multiplier.textContent = "×";

      const quantity = document.createElement("div");
      quantity.className = "quantity";
      quantity.textContent = item.quantity;

      priceBox.appendChild(priceVal);
      priceBox.appendChild(priceUnit);
      unit.appendChild(priceBox);
      unit.appendChild(multiplier);
      unit.appendChild(quantity);

      container.appendChild(unit);
    });
  }

  updateRemaining(amount) {
    const remainPrice = document.getElementById("remain-price");
    const priceVal = remainPrice.querySelector(".price-val");
    priceVal.textContent = amount;
  }
}

// 初始化應用
document.addEventListener("DOMContentLoaded", () => {
  new SnackCalculator();
});
