import { useFastSpringCheckout } from "./useFastSpringCheckout.js";

const PRODUCT_PATH = "odyssey";

export default function CheckoutPage() {
  const { ready } = useFastSpringCheckout(PRODUCT_PATH);

  return (
    <div className="checkout">
      <div>
        <p className="panel-label">Order Summary</p>
        <div className="summary-card">
          <div className="product-row">
            <img
              className="product-thumb"
              data-fsc-item-path={PRODUCT_PATH}
              data-fsc-item-image
              alt=""
            />
            <div className="product-info">
              <p
                className="product-title"
                data-fsc-item-path={PRODUCT_PATH}
                data-fsc-item-display
              />
              <p
                className="product-desc"
                data-fsc-item-path={PRODUCT_PATH}
                data-fsc-item-description-summary
              />
              <div className="product-meta">
                <span>
                  Qty{" "}
                  <span
                    data-fsc-item-path={PRODUCT_PATH}
                    data-fsc-item-quantity
                  />{" "}
                  &middot;{" "}
                  <span data-fsc-item-path={PRODUCT_PATH} data-fsc-item-price />{" "}
                  each
                </span>
              </div>
            </div>
          </div>

          <div className="breakdown">
            <div className="breakdown-row">
              <span>Discount total</span>
              <span
                data-fsc-item-path={PRODUCT_PATH}
                data-fsc-item-discounttotal
              />
            </div>
            <div className="breakdown-row total">
              <span>Total</span>
              <span
                className="product-item-total"
                data-fsc-item-path={PRODUCT_PATH}
                data-fsc-item-total
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="panel-label">Payment Details</p>
        <div className="payment-card">
          {!ready && (
            <div className="payment-placeholder">
              <div className="spinner" />
              <span>Loading secure payment form&hellip;</span>
            </div>
          )}
          <div id="fsc-embedded-checkout-container" />
        </div>
      </div>
    </div>
  );
}
