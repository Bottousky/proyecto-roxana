// Landing page logic: cart, content rendering
import { readSchoolState, type AulaId } from './schoolModel.ts';

interface Product {
  id: string;
  code: string;
  motif: string;
  nombre: string;
  desc: string;
  price: number; // €
}

interface Aula {
  id: AulaId;
  motif: string;
  disciplina: string;
  nombre: string;
  desc: string;
}

interface FichaTecnica {
  k: string;
  v: string;
}

const PRODUCTS: Product[] = [
  { id: 'ohm-01', code: 'OHM-01', motif: '📖', nombre: 'Bitácora', desc: 'Cuaderno de anotaciones del Instituto', price: 18 },
  { id: 'ohm-02', code: 'OHM-02', motif: '≈', nombre: 'Lámina «El Río»', desc: 'Póster del concepto de Ohm', price: 24 },
  { id: 'ohm-03', code: 'OHM-03', motif: '👕', nombre: 'Camiseta', desc: 'Edición oficial Instituto Roxana', price: 26 },
  { id: 'ohm-04', code: 'OHM-04', motif: '📌', nombre: 'Pines (set 3)', desc: 'Set de pines del Instituto', price: 12 },
  { id: 'ohm-05', code: 'OHM-05', motif: '☕', nombre: 'Taza «I=V/R»', desc: 'Taza de cerámica con la ley de Ohm', price: 14 },
  { id: 'ohm-06', code: 'OHM-06', motif: '🔖', nombre: 'Stickers', desc: 'Pack de stickers del juego', price: 8 },
];

const AULAS: Aula[] = [
  { id: 'electronica', motif: 'Ω', disciplina: 'Electrónica', nombre: 'Ohmdal', desc: 'Corriente, resistencia, la chispa que lo mueve.' },
  { id: 'programacion', motif: '{ }', disciplina: 'Programación', nombre: 'Bitland', desc: 'Lógica, bucles, estructuras de pensamiento.' },
  { id: 'fisica', motif: 'Δ', disciplina: 'Física', nombre: 'Physica', desc: 'Movimiento, energía y las leyes que lo gobiernan.' },
  { id: 'matematica', motif: '∑', disciplina: 'Matemática', nombre: 'Arithmos', desc: 'Números como fuerzas, ecuaciones como equilibrio.' },
];

const FICHA: FichaTecnica[] = [
  { k: 'Formato', v: 'Juego web' },
  { k: 'Motor', v: 'Phaser 4 + TypeScript' },
  { k: 'Progreso', v: 'Arco I (5 unidades)' },
  { k: 'Estado', v: 'Greybox jugable' },
  { k: 'Plataforma', v: 'Navegador (Chromebook, mobile, desktop)' },
];

type CartState = Record<string, number>;

class Landing {
  private cart: CartState = {};
  private cartOpen = false;

  constructor() {
    this.loadCart();
    this.setupEventListeners();
    this.renderContent();
    this.updateCartUI();
  }

  private loadCart(): void {
    const stored = localStorage.getItem('roxana_cart');
    if (stored) {
      try {
        this.cart = JSON.parse(stored);
      } catch {
        this.cart = {};
      }
    }
  }

  private saveCart(): void {
    localStorage.setItem('roxana_cart', JSON.stringify(this.cart));
  }

  private setupEventListeners(): void {
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartBackdrop = document.getElementById('cart-backdrop');

    cartBtn?.addEventListener('click', () => this.toggleCart());
    closeCartBtn?.addEventListener('click', () => this.toggleCart());
    cartBackdrop?.addEventListener('click', () => this.toggleCart());

    // Cart actions
    document.getElementById('checkout-btn')?.addEventListener('click', () => this.checkout());
    document.getElementById('clear-cart-btn')?.addEventListener('click', () => this.clearCart());

    // Store buttons
    document.querySelectorAll('[data-product-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = (btn as HTMLElement).dataset.productId;
        if (productId) this.addToCart(productId);
      });
    });
  }

  private toggleCart(): void {
    this.cartOpen = !this.cartOpen;
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.style.display = this.cartOpen ? 'flex' : 'none';
    if (drawer) drawer.style.flexDirection = 'column';
    if (backdrop) backdrop.style.display = this.cartOpen ? 'block' : 'none';
  }

  private addToCart(productId: string): void {
    if (!this.cart[productId]) this.cart[productId] = 0;
    this.cart[productId]++;
    this.saveCart();
    this.updateCartUI();
    this.showToast(`Añadido a la cesta`);
  }

  private removeFromCart(productId: string): void {
    delete this.cart[productId];
    this.saveCart();
    this.updateCartUI();
  }

  private updateQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cart[productId] = qty;
      this.saveCart();
      this.updateCartUI();
    }
  }

  private clearCart(): void {
    this.cart = {};
    this.saveCart();
    this.updateCartUI();
    this.showToast('Cesta vaciada');
  }

  private checkout(): void {
    this.cart = {};
    this.saveCart();
    this.cartOpen = false;
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    this.updateCartUI();
    this.showToast('Pedido confirmado — ¡gracias!');
  }

  private updateCartUI(): void {
    const count = Object.values(this.cart).reduce((a, b) => a + b, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = String(count);

    const cartItems = document.getElementById('cart-items');
    const cartFooter = document.getElementById('cart-footer');
    if (!cartItems || !cartFooter) return;

    if (count === 0) {
      cartItems.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 40px 20px;">Tu cesta está vacía</p>';
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = 'block';

    let total = 0;
    cartItems.innerHTML = '';
    Object.entries(this.cart).forEach(([productId, qty]) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return;

      total += product.price * qty;

      const line = document.createElement('div');
      line.style.cssText =
        'display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border);';
      line.innerHTML = `
        <div>
          <div style="font-weight: 600; color: var(--text);">${product.nombre}</div>
          <div style="font-size: 12px; color: var(--muted);">${product.code}</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="qty-down" data-product-id="${productId}" style="background: transparent; border: 1px solid var(--border); width: 24px; height: 24px; border-radius: 4px; cursor: pointer; color: var(--text);">−</button>
          <span style="min-width: 24px; text-align: center;">${qty}</span>
          <button class="qty-up" data-product-id="${productId}" style="background: transparent; border: 1px solid var(--border); width: 24px; height: 24px; border-radius: 4px; cursor: pointer; color: var(--text);">+</button>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600; color: var(--text);">€${(product.price * qty).toFixed(2)}</div>
          <button class="remove-item" data-product-id="${productId}" style="background: transparent; color: var(--accent); border: none; cursor: pointer; font-size: 12px; padding: 0; margin-top: 4px;">Quitar</button>
        </div>
      `;
      cartItems.appendChild(line);
    });

    // Attach qty handlers
    document.querySelectorAll('.qty-down').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = (btn as HTMLElement).dataset.productId;
        if (productId) this.updateQty(productId, (this.cart[productId] || 0) - 1);
      });
    });
    document.querySelectorAll('.qty-up').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = (btn as HTMLElement).dataset.productId;
        if (productId) this.updateQty(productId, (this.cart[productId] || 0) + 1);
      });
    });
    document.querySelectorAll('.remove-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = (btn as HTMLElement).dataset.productId;
        if (productId) this.removeFromCart(productId);
      });
    });

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
  }

  private showToast(message: string): void {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 1700);
  }

  private renderContent(): void {
    // Ficha técnica
    const fichaRows = document.getElementById('ficha-rows');
    if (fichaRows) {
      fichaRows.innerHTML = FICHA.map(
        (row) =>
          `<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 20px; padding: 15px 0; border-top: 1px solid var(--border);">
          <span style="font-size: 14px; color: var(--muted);">${row.k}</span>
          <span style="font-size: 14.5px; font-weight: 600; color: var(--text); text-align: right;">${row.v}</span>
        </div>`,
      ).join('');
    }

    // Aulas grid
    const aulasGrid = document.getElementById('aulas-grid');
    if (aulasGrid) {
      const school = readSchoolState();
      aulasGrid.innerHTML = AULAS.map((a) => {
        const estado = school.aulas[a.id];
        const activa = estado !== 'cerrada';

        let badgeLabel: string;
        if (!activa) {
          badgeLabel = 'Próximamente';
        } else if (estado === 'off') {
          badgeLabel = 'Disponible';
        } else if (estado === 'enCurso') {
          badgeLabel = `En curso — ${school.electronica.unidadesCompletadas}/${school.electronica.totalUnidades} unidades`;
        } else {
          badgeLabel = 'Arco I completado';
        }

        const badgeStyle = activa
          ? "color: #1a1408; background: var(--accent); border-radius: 20px; padding: 5px 11px; font-weight: 600;"
          : "color: var(--muted); border: 1px solid var(--border); border-radius: 20px; padding: 5px 11px;";

        const linkHtml = activa
          ? `<a href="/src/jugar/" style="color: var(--accent); text-decoration: none; font-size: 14.5px; font-weight: 600;">Entrar a Ohmdal →</a>`
          : '';

        return `
          <div style="position: relative; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 26px 24px 24px; display: flex; flex-direction: column; gap: 12px; min-height: 240px; transition: transform 0.18s, border-color 0.18s; cursor: pointer;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--accent-dim)'" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
              <div style="width: 56px; height: 56px; border-radius: 12px; background: var(--panel2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: 'Spectral', serif; font-size: 28px; color: var(--accent);">${a.motif}</div>
              <span style="font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; ${badgeStyle}">${badgeLabel}</span>
            </div>
            <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-top: 6px;">${a.disciplina} — ${a.nombre}</div>
            <h3 style="font-family: 'Spectral', serif; font-weight: 600; font-size: 23px; margin: 0; letter-spacing: -0.01em;">${a.nombre}</h3>
            <p style="font-size: 14.5px; line-height: 1.5; color: var(--muted); margin: 0; flex: 1;">${a.desc}</p>
            ${linkHtml}
          </div>
        `;
      }).join('');
    }

    // Store grid
    const storeGrid = document.getElementById('store-grid');
    if (storeGrid) {
      storeGrid.innerHTML = PRODUCTS.map((p) => {
        return `
          <div style="background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 14px; transition: transform 0.18s, border-color 0.18s; cursor: pointer;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--accent-dim)'" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='var(--border)'">
            <div style="aspect-ratio: 4/3; background: var(--panel2); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: var(--accent);">${p.motif}</div>
            <div>
              <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px;">${p.code}</div>
              <h4 style="font-family: 'Spectral', serif; font-weight: 600; font-size: 18px; margin: 0 0 8px;">${p.nombre}</h4>
              <p style="font-size: 13.5px; line-height: 1.5; color: var(--muted); margin: 0 0 12px;">${p.desc}</p>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-family: 'Spectral', serif; font-weight: 600; font-size: 18px; color: var(--text);">€${p.price}</span>
              <button data-product-id="${p.id}" style="background: var(--accent); color: #1a1408; border: none; border-radius: 8px; padding: 8px 14px; font-weight: 600; font-size: 13px; cursor: pointer;">Añadir</button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Re-attach handlers after rendering
    this.setupEventListeners();
  }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  new Landing();
});
