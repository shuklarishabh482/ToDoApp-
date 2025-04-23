import "./ToDo.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState, useEffect,useMemo} from "react";
import axios from "axios";
import { v4 as uuid } from 'uuid';
import Swal from 'sweetalert2';

let ToDo = () => {

  let [searchWork, setSearchWork] = useState("");
  let [works, setWorks] = useState([{ work: "code", id: uuid(), done: false }]);
  let [newWork, setNewWork] = useState("");
  let [loading, setLoading] = useState(true);
  let [fetchedWorks, setFetchedWorks] = useState([]);
  let [showCompleted, setShowCompleted] = useState(true);
  let [error, setError] = useState(null);
  let [history,setHistory] = useState([]);
  let [future ,setFuture] = useState([]);
  let [appLoading, setAppLoading] = useState(true);
let  [isDarkMode , setIsDarkMode] = useState(false);
let toggleTheme = ()=> setIsDarkMode(prev=> !prev);

  const updateWorks = (newWorks, saveHistory = true,clearFuture = true) => {
    if (saveHistory) setHistory((prev) => [...prev, works]);
    setWorks(newWorks);
    // setFuture([]);
    if (clearFuture) setFuture ([]);


}
// undo function 
const undo = ()=>{
  if (history.length === 0) return;        // No previous history
  const previous = history[history.length - 1];  // Last item
  const newHistory = history.slice(0, history.length - 1); // Remove last
  setHistory(newHistory);
  setFuture((prev) => [works, ...prev]);      
  updateWorks(previous ,false ,false);                
  
}

const redo = () => {
  console.log("redo invoked")
  if (future.length === 0) return;          // No future state
  const next = future[0];                   // First in future
  const newFuture = future.slice(1);        // Remove it
  setHistory((prev) => [...prev, works]);   // Push current to 
  setFuture(newFuture);      
  updateWorks (next ,false ,false);
                     
};

// 10 ToDoTask that fetched 
  const FetchedWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/todos?_limit=10");
      const rearrangedToDo = response.data.map((work) => ({
        id: work.id,
        work: work.title, 
        userId: work.userId,
        done: work.completed, 
      }));
      setFetchedWorks(rearrangedToDo);
    } catch (err) {
      console.error(`Error fetching todos: ${err}`);
      setError("Failed to fetch ToDoWork. Please check your connection!");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
const init = async ()=>{
  const savedWorks = JSON.parse(localStorage.getItem("works")) || [{ work: "code", id: uuid(), done: false }];
  updateWorks(savedWorks);
  await FetchedWorks();
  setAppLoading(false);

}
init ();
  
  }, []);

useEffect(() => {
  if (!loading) {
    const timeout = setTimeout(() => {
      localStorage.setItem("works", JSON.stringify(works));
    }, 500);

    return () => clearTimeout(timeout);
  }
}, [works, loading]);


  const onClickHandler = () => {
    if (newWork.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please enter some task before adding!",
      });
      return;
    }

    updateWorks([...works ,{work : newWork , id : uuid (), done : false }])
    setNewWork("");
  };

let onChangeHandler = (eventObj) => setNewWork(eventObj.target.value);

  
  let onDeleteHandler = (deleteElId) => {
    updateWorks((prevWorks) => prevWorks.filter((work) => work.id !== deleteElId));
  }
  const upperCaseAll = () => {
    updateWorks((prevWorks) => prevWorks.map((work) => ({ ...work, work: work.work.toUpperCase() })));
  };
  const updateOne = (id) => {
    updateWorks((prevWorks) =>
      prevWorks.map((work) => (work.id === id ? { ...work, work: work.work.toUpperCase() } : work))
    );
  };
  // done 
  const done = (id) => {
    updateWorks((prevWorks) =>
      prevWorks.map((work) => (work.id === id ? { ...work, done: true } : work))
    );
  };

  // drag and drop handler 
  const doneAll = () => {
    updateWorks((prevWorks) => prevWorks.map((work) => ({ ...work, done: true })));
  };

  let onDragEndhandler = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;

    const items = Array.from(works);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateWorks(items);
  }


  let toggleShowCompleted = () => {
    setShowCompleted((prev) => !prev)
  }

  const retryFetchWorks = () => {
    FetchedWorks();
  };

  // memoized 
  const filteredWorks = useMemo(() => 
    works.filter((work) =>
      work.work && work.work.toLowerCase().includes(searchWork.toLowerCase())
    ),
    [works, searchWork]
  );

return (
<div className={`work-container ${isDarkMode ? "dark" : "light"}`}>
{appLoading ? (
  <p>Loading app...</p>
) : (
  <>
    <h1 className="title">ToDoApp</h1>
    <button onClick={toggleTheme} className="DarkMode">Dark/Light Mode</button>

    <div className="fetched-toDoWork-section">
      <h3>Fetched Todos</h3>
      {loading ? (
        <p>Loading fetched works...</p>
      ) : error ? (
        <>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={retryFetchWorks} className="retryBtn">Retry</button>
        </>
      ) : (
        <>
          <button onClick={toggleShowCompleted}>
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </button>
          <ul>
            {fetchedWorks
              .filter((work) => (showCompleted ? true : !work.done))
              .map((work) => (
                <li key={work.id}>
                  <strong>UserID: </strong>{work.userId} &nbsp;
                  <strong>Title: </strong>{work.work}
                  {work.done && <span style={{ color: "green" }}>(Completed)</span>}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>

    <div className="add-work">
      <input 
        placeholder="Enter your work"
        value={newWork}
        onChange={onChangeHandler}
      />
      <br /><br />
      <button type="submit" onClick={onClickHandler}>
        Add Work!
      </button>

      <div className="undo-redo-buttons" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={undo} disabled={history.length === 0}>Undo</button>
        <button onClick={redo} disabled={future.length === 0}>Redo</button>
      </div>
    </div>

    <div className="search-bar">
      <input
        type="text"
        placeholder="Search Your Works"
        value={searchWork}
        onChange={(e) => setSearchWork(e.target.value)}
      />
    </div>

    {/* ✨ HIGHLIGHT: using filteredWorks */}
    <DragDropContext onDragEnd={onDragEndhandler}>
      <Droppable droppableId="works">
        {(provided) => (
          <ol
            className="work-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {filteredWorks.map((work, index) => (
              <Draggable key={work.id} draggableId={work.id} index={index}>
                {(provided) => (
                  <li
                    className="work-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <span
                      style={
                        work.done
                          ? { textDecoration: "line-through", backgroundColor: "green" }
                          : {}
                      }
                    >
                      {work.work}
                    </span>
                    &nbsp;
                    <div className="work-buttons">
                      <button onClick={() => onDeleteHandler(work.id)}>Delete</button>
                      <button onClick={() => updateOne(work.id)}>toUpperCase</button>
                      <button onClick={() => done(work.id)}>Mark as Done</button>
                    </div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ol>
        )}
      </Droppable>
    </DragDropContext>

    <button onClick={upperCaseAll}>UpperCaseAll</button>
    <br />
    <button onClick={doneAll}>Mark All Done</button>
  </>
)}
</div>


)
}
export default ToDo;




















