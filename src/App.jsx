import React, { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'restaurant-chatbot-session';
const MENU_ITEMS = [
  { id: 'jollof', name: 'Jollof Rice', price: 2500, description: 'Spiced rice with chicken' },
  { id: 'burger', name: 'Chicken Burger', price: 3200, description: 'Crispy chicken burger with slaw' },
  { id: 'pizza', name: 'Pepperoni Pizza', price: 4800, description: 'Classic pizza with pepperoni' },
  { id: 'salad', name: 'Caesar Salad', price: 2100, description: 'Fresh greens with dressing' },
  { id: 'pasta', name: 'Creamy Pasta', price: 3000, description: 'Pasta in a luscious cream sauce' }
];

const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

function generateSessionId() {
  return `device-${Math.random().toString(36).slice(2, 10)}`;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [customerEmail, setCustomerEmail] = useState(import.meta.env.VITE_PAYSTACK_EMAIL || 'customer@example.com');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [mode, setMode] = useState('main');
  const [pendingSchedule, setPendingSchedule] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    const existingSession = localStorage.getItem(STORAGE_KEY) || generateSessionId();
    localStorage.setItem(STORAGE_KEY, existingSession);
    setSessionId(existingSession);

    const savedPayload = localStorage.getItem(`${STORAGE_KEY}:${existingSession}`);
    if (savedPayload) {
      try {
        const parsed = JSON.parse(savedPayload);
        setCurrentOrder(parsed.currentOrder || null);
        setOrderHistory(parsed.orderHistory || []);
      } catch (error) {
        console.error('Could not load session data', error);
      }
    }

    setMessages([
      {
        role: 'bot',
        text: 'Welcome to Chefly Kitchen! Select an option to continue.',
        options: [
          { label: '1. Place an order', value: '1' },
          { label: '99. Checkout order', value: '99' },
          { label: '98. See order history', value: '98' },
          { label: '97. See current order', value: '97' },
          { label: '0. Cancel order', value: '0' },
          { label: '101. Schedule order', value: '101' }
        ]
      }
    ]);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const payload = JSON.stringify({ currentOrder, orderHistory });
    localStorage.setItem(`${STORAGE_KEY}:${sessionId}`, payload);
  }, [sessionId, currentOrder, orderHistory]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text, options = []) => {
    setMessages((prev) => [...prev, { role: 'bot', text, options }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: 'user', text }]);
  };

  const buildOrderSummary = (order) => {
    if (!order?.items?.length) return 'No items added yet.';
    const itemsText = order.items.map((entry) => `${entry.item.name} x${entry.quantity}`).join(', ');
    return `${itemsText} — Total ${formatCurrency(order.total)}`;
  };

  const resetToMainMenu = () => {
    setMode('main');
    setPendingSchedule(false);
    addBotMessage('What would you like to do next?', [
      { label: '1. Place an order', value: '1' },
      { label: '99. Checkout order', value: '99' },
      { label: '98. See order history', value: '98' },
      { label: '97. See current order', value: '97' },
      { label: '0. Cancel order', value: '0' },
      { label: '101. Schedule order', value: '101' }
    ]);
  };

  const handleCheckout = () => {
    if (!currentOrder?.items?.length) {
      addBotMessage('No order to place. Start by selecting an item from the menu.', [
        { label: 'Place a new order', value: '1' }
      ]);
      return;
    }

    const placedOrder = {
      ...currentOrder,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      status: 'pending-payment',
      placedAt: new Date().toLocaleString()
    };

    setCurrentOrder(placedOrder);
    setOrderHistory((prev) => [placedOrder, ...prev]);
    addBotMessage(`Order placed successfully. Your order ID is ${placedOrder.id}. Total is ${formatCurrency(placedOrder.total)}. Pay now to complete your transaction.`, [
      { label: 'Pay now', value: 'pay' },
      { label: 'Back to main menu', value: 'menu' }
    ]);
    setPaymentNotice('');
  };

  const handleCancelOrder = () => {
    if (!currentOrder?.items?.length) {
      addBotMessage('There is no active order to cancel.');
      return;
    }

    setCurrentOrder(null);
    setPaymentNotice('');
    addBotMessage('Your current order has been cancelled.');
  };

  const handleShowHistory = () => {
    if (!orderHistory.length) {
      addBotMessage('You do not have any previous orders yet.');
      return;
    }

    const historyText = orderHistory
      .map((order) => `${order.id} — ${order.items.map((entry) => `${entry.item.name} x${entry.quantity}`).join(', ')} (${formatCurrency(order.total)})`)
      .join('\n');

    addBotMessage(`Here is your order history:\n${historyText}`);
  };

  const handleShowCurrentOrder = () => {
    if (!currentOrder?.items?.length) {
      addBotMessage('You do not have a current order right now.');
      return;
    }

    addBotMessage(`Current order:\n${buildOrderSummary(currentOrder)}\nStatus: ${currentOrder.status}`);
  };

  const handlePay = () => {
    if (!currentOrder?.items?.length) {
      addBotMessage('There is no order waiting for payment.');
      return;
    }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';
    if (!paystackKey || paystackKey.includes('placeholder')) {
      const paidOrder = { ...currentOrder, status: 'paid' };
      setCurrentOrder(paidOrder);
      setOrderHistory((prev) => prev.map((order) => (order.id === paidOrder.id ? paidOrder : order)));
      setPaymentNotice('Payment simulated successfully. Your order is now confirmed.');
      resetToMainMenu();
      addBotMessage(`Payment was successful. You are back in the chatbot and your order ${paidOrder.id} is confirmed.`, [
        { label: 'Back to main menu', value: 'menu' }
      ]);
      return;
    }

    const verifyPaymentWithBackend = async (reference) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const verifyResponse = await fetch(`${apiUrl}/api/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference })
        });

        const result = await verifyResponse.json();

        if (result.success) {
          const paidOrder = { ...currentOrder, status: 'paid', paymentReference: reference };
          setCurrentOrder(paidOrder);
          setOrderHistory((prev) => prev.map((order) => (order.id === paidOrder.id ? paidOrder : order)));
          setPaymentNotice(`✓ Payment verified successfully. Reference: ${reference}`);
          resetToMainMenu();
          addBotMessage(
            `🎉 Payment completed and verified! Your order ${paidOrder.id} is confirmed. You can pick up your order at the counter.`,
            [{ label: 'Back to main menu', value: 'menu' }]
          );
        } else {
          addBotMessage(`Payment verification failed: ${result.message}. Please contact support.`);
          setPaymentNotice(`⚠ Verification issue: ${result.message}`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        addBotMessage(`Error verifying payment: ${error.message}. Please contact support.`);
        setPaymentNotice(`⚠ Error: ${error.message}`);
      }
    };

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: customerEmail,
      amount: currentOrder.total * 100,
      currency: 'NGN',
      ref: `${Date.now()}-${currentOrder.id}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Order ID',
            variable_name: 'order_id',
            value: currentOrder.id
          }
        ]
      },
      channels: ['card', 'bank'],
      onClose: () => {
        addBotMessage('Payment window closed. Your order remains pending payment.');
      },
      callback: (response) => {
        addBotMessage('Processing your payment... Please wait.');
        verifyPaymentWithBackend(response.reference);
      }
    });

    handler.openIframe();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    addUserMessage(trimmedValue);
    setInputValue('');

    if (pendingSchedule) {
      setPendingSchedule(false);
      if (!currentOrder?.items?.length) {
        addBotMessage('There is no active order to schedule.');
        return;
      }
      const scheduledAt = trimmedValue;
      const updatedOrder = { ...currentOrder, scheduledAt };
      setCurrentOrder(updatedOrder);
      setOrderHistory((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
      addBotMessage(`Your order is scheduled for ${scheduledAt}.`);
      return;
    }

    if (mode === 'menu') {
      if (trimmedValue === '99') {
        handleCheckout();
        return;
      }
      if (trimmedValue === '0') {
        handleCancelOrder();
        return;
      }

      const selectedItem = MENU_ITEMS[Number(trimmedValue) - 1];
      if (!selectedItem) {
        addBotMessage('Please choose a valid menu number from 1 to 5, or enter 99 to checkout.');
        return;
      }

      setCurrentOrder((prev) => {
        if (!prev || !prev.items?.length) {
          const newOrder = {
            items: [{ item: selectedItem, quantity: 1 }],
            total: selectedItem.price,
            status: 'draft'
          };
          return newOrder;
        }

        const existingIndex = prev.items.findIndex((entry) => entry.item.id === selectedItem.id);
        if (existingIndex >= 0) {
          const updatedItems = [...prev.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + 1
          };
          return { ...prev, items: updatedItems, total: prev.total + selectedItem.price };
        }

        return { ...prev, items: [...prev.items, { item: selectedItem, quantity: 1 }], total: prev.total + selectedItem.price };
      });

      addBotMessage(`Added ${selectedItem.name} to your order. Your current total is ${formatCurrency((currentOrder?.total || 0) + selectedItem.price)}. Select another item or enter 99 to checkout.`, MENU_ITEMS.map((item, index) => ({ label: `${index + 1}. ${item.name} (${formatCurrency(item.price)})`, value: String(index + 1) })));
      return;
    }

    switch (trimmedValue) {
      case '1':
        setMode('menu');
        addBotMessage('Please choose an item from the menu below:', MENU_ITEMS.map((item, index) => ({ label: `${index + 1}. ${item.name} (${formatCurrency(item.price)})`, value: String(index + 1) })));
        break;
      case '99':
        handleCheckout();
        break;
      case '98':
        handleShowHistory();
        break;
      case '97':
        handleShowCurrentOrder();
        break;
      case '0':
        handleCancelOrder();
        break;
      case '101':
        if (!currentOrder?.items?.length) {
          addBotMessage('There is no active order to schedule.');
          break;
        }
        setPendingSchedule(true);
        addBotMessage('Please enter a delivery or pickup time such as 2026-07-03 19:30.');
        break;
      case 'pay':
        handlePay();
        break;
      case 'menu':
        resetToMainMenu();
        break;
      default:
        addBotMessage('Please enter a valid option: 1, 99, 98, 97, 0, or 101.');
        break;
    }
  };

  const quickAction = (value) => {
    setInputValue(value);
    const syntheticEvent = { preventDefault: () => {} };
    handleSubmit(syntheticEvent);
  };

  const renderActions = (options) => (
    <div className="chip-row">
      {options.map((option) => (
        <button key={option.value} type="button" className="chip" onClick={() => quickAction(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );

  const currentOrderSummary = useMemo(() => {
    if (!currentOrder?.items?.length) return 'No active order.';
    return `${currentOrder.items.length} item(s) in your order • ${formatCurrency(currentOrder.total)} • ${currentOrder.status}`;
  }, [currentOrder]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Restaurant ChatBot</p>
          <h1>Chefly Kitchen</h1>
        </div>
        <div className="status-card">
          <strong>Current order</strong>
          <span>{currentOrderSummary}</span>
        </div>
      </header>

      <main className="chat-card">
        <div className="messages-list">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message ${message.role}`}>
              <div className="message-bubble">
                <p>{message.text}</p>
              </div>
              {message.options?.length ? renderActions(message.options) : null}
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        {paymentNotice ? <div className="payment-notice">{paymentNotice}</div> : null}

        <form className="composer" onSubmit={handleSubmit}>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Type 1, 99, 98, 97, 0, 101 or a menu number"
          />
          <button type="submit">Send</button>
        </form>
      </main>
    </div>
  );
}

export default App;
