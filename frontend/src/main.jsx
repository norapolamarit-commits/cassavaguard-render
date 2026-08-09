/* Mount the app. */
(function () {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(window.CG.Store.Provider, null,
      React.createElement(window.CG.App)
    )
  );
})();
