// 小廢物清算機 JavaScript
class SnackCalculator {
  constructor() {
    this.amount = 0;
    this.selectedPrices = new Set();
    this.mode = "max-items"; // "max-items" or "min-left"
    this.theme = this.getInitialTheme();
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.renderPriceOptions();
    this.updateResults();
    this.applyTheme(this.theme);
  }
  
  setupEventListeners() {
    // 金額輸入
    const amountInput = document.getElementById("amount");
    amountInput.addEventListener("input", (e) => {
      this.amount = parseInt(e.target.value) || 0;
      this.updateResults();
    });
    
    // 計算按鈕
    const calcBtn = document.getElementById("calc");
    calcBtn.addEventListener("click", () => {
      this.updateResults();
    });
    
    // 模式切換
    const maxItemsBtn = document.getElementById("mode-max-items");
    const minLeftBtn = document.getElementById("mode-min-left");
    
    maxItemsBtn.addEventListener("click", () => {
      this.setMode("max-items");
    });
    
    minLeftBtn.addEventListener("click", () => {
      this.setMode("min-left");
    });

    // 主題切換
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("click", () => {
      const nextTheme = this.theme === "dark" ? "light" : "dark";
      this.setTheme(nextTheme);
    });
  }
  
  setMode(mode) {
    this.mode = mode;
    
    // 更新按鈕狀態
    const maxItemsBtn = document.getElementById("mode-max-items");
    const minLeftBtn = document.getElementById("mode-min-left");
    
    maxItemsBtn.classList.toggle("is-active", mode === "max-items");
    maxItemsBtn.setAttribute("aria-selected", mode === "max-items");
    minLeftBtn.classList.toggle("is-active", mode === "min-left");
    minLeftBtn.setAttribute("aria-selected", mode === "min-left");
    
    this.updateResults();
  }

  // 主題：初始化與切換
  getInitialTheme() {
    const stored = localStorage.getItem("snack_theme");
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? "dark" : "light";
  }

  applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    this.theme = theme;
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", theme === "dark");
      toggle.textContent = theme === "dark" ? "🌞 亮色" : "🌙 暗色";
    }
  }

  setTheme(theme) {
    localStorage.setItem("snack_theme", theme);
    this.applyTheme(theme);
  }
  
  renderPriceOptions() {
    const container = document.getElementById("price-options");
    const prices = [17, 18, 21, 23, 24, 25, 27, 32, 33, 34, 35, 41, 53];
    
    // 建立全選 checkbox
    const selectAllContainer = document.createElement("div");
    selectAllContainer.className = "checkbox select-all";
    
    const selectAllInput = document.createElement("input");
    selectAllInput.type = "checkbox";
    selectAllInput.id = "select-all";
    selectAllInput.checked = true; // 預設全選
    
    const selectAllLabel = document.createElement("label");
    selectAllLabel.htmlFor = "select-all";
    selectAllLabel.textContent = "全選";
    
    selectAllContainer.appendChild(selectAllInput);
    selectAllContainer.appendChild(selectAllLabel);
    
    // 全選 checkbox 事件監聽
    selectAllInput.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      
      // 更新所有價格 checkbox
      prices.forEach(price => {
        const priceInput = document.getElementById(`price-${price}`);
        if (priceInput) {
          priceInput.checked = isChecked;
          if (isChecked) {
            this.selectedPrices.add(price);
          } else {
            this.selectedPrices.delete(price);
          }
        }
      });
      
      this.updateResults();
    });
    
    // 將全選 checkbox 放在最前面
    container.appendChild(selectAllContainer);
    
    // 建立所有價格 checkbox
    prices.forEach(price => {
      const checkbox = document.createElement("div");
      checkbox.className = "checkbox";
      
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `price-${price}`;
      input.checked = [21, 23, 32, 33, 34, 35, 41].includes(price); // 預設選中
      
      const label = document.createElement("label");
      label.htmlFor = `price-${price}`;
      label.textContent = `${price}元`;
      
      checkbox.appendChild(input);
      checkbox.appendChild(label);
      
      // 監聽選中狀態變化
      input.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.selectedPrices.add(price);
        } else {
          this.selectedPrices.delete(price);
        }
        
        // 檢查是否需要取消全選
        this.updateSelectAllState();
        
        this.updateResults();
      });
      
      // 初始化選中狀態
      if (input.checked) {
        this.selectedPrices.add(price);
      }
      
      container.appendChild(checkbox);
    });
    
    // 初始化全選狀態
    this.updateSelectAllState();
  }
  
  updateSelectAllState() {
    const selectAllInput = document.getElementById("select-all");
    const prices = [17, 18, 21, 23, 24, 25, 27, 32, 33, 34, 35, 41, 53];
    
    // 檢查是否所有價格都被選中
    const allSelected = prices.every(price => this.selectedPrices.has(price));
    
    // 更新全選 checkbox 狀態
    if (selectAllInput) {
      selectAllInput.checked = allSelected;
      selectAllInput.indeterminate = !allSelected && this.selectedPrices.size > 0;
    }
  }
  
  calculateOptimalPurchase() {
    if (this.amount <= 0 || this.selectedPrices.size === 0) {
      return { items: [], remaining: this.amount };
    }
    
    const prices = Array.from(this.selectedPrices).sort((a, b) => a - b);
    let remaining = this.amount;
    const items = [];
    
    if (this.mode === "max-items") {
      // 買最多品項：優先買便宜的
      for (const price of prices) {
        const maxQuantity = Math.floor(remaining / price);
        if (maxQuantity > 0) {
          items.push({ price, quantity: maxQuantity });
          remaining -= price * maxQuantity;
        }
      }
    } else {
      // 剩餘最少錢：優先買貴的
      for (let i = prices.length - 1; i >= 0; i--) {
        const price = prices[i];
        const maxQuantity = Math.floor(remaining / price);
        if (maxQuantity > 0) {
          items.push({ price, quantity: maxQuantity });
          remaining -= price * maxQuantity;
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
  
  renderResults(items) {
    const container = document.getElementById("result-list");
    container.innerHTML = "";
    
    if (items.length === 0) {
      container.innerHTML = "<div class=\"no-results\">無法購買任何品項</div>";
      return;
    }
    
    items.forEach((item, index) => {
      // 如果不是第一個項目，先添加分隔符號
      if (index > 0) {
        const separator = document.createElement("div");
        separator.className = "multiplier";
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
