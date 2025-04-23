// export const undoHelper = (history, works, setHistory, setFuture, updateWorks) => {
//     if (history.length === 0) return;
//     const previous = history[history.length - 1];
//     const newHistory = history.slice(0, history.length - 1);
//     setHistory(newHistory);
//     setFuture((prev) => [works, ...prev]);
//     updateWorks(previous, false, false);
//   };
  

//   export const redoHelper = (future, works, setHistory, setFuture, updateWorks) => {
//     if (future.length === 0) return;
//     const next = future[0];
//     const newFuture = future.slice(1);
//     setHistory((prev) => [...prev, works]);
//     setFuture(newFuture);
//     updateWorks(next, false, false);
//   };

