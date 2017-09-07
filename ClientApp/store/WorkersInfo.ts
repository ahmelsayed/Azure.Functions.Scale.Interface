import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import axios from 'axios';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface WorkersInfoState {
    isLoading: boolean;
    workersInfo: WorkerInfo[];
}

export interface WorkerInfo {
    id: string;
    stampName: string;
    workerName: string;
    loadFactor: string;
    lastModifiedTimeUtc: string;
    isManager: string;
    isStale: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestWorkersInfoAction {
    type: 'REQUEST_WORKERS_INFO';
    force: boolean;
}

interface ReceiveWorkersInfoAction {
    type: 'RECEIVE_WORKERS_INFO';
    workersInfo: WorkerInfo[];
}

interface ChangeWorkerAction {
    type: 'PING_WORKER' | 'ADD_WORKER' | 'REMOVE_WORKER';
    workerId: string;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestWorkersInfoAction | ReceiveWorkersInfoAction | ChangeWorkerAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

const rootPath = '/';
const workersPath = `${rootPath}api/workers`;
const workerPath = `${workersPath}/{id}`;
const addWorkerPath = `${workerPath}/add`;
const pingWorkerPath = `${workerPath}/ping`;
let fetched = false;

let requestWorkers = (dispatch: Function) => {
    let fetchTask = axios.get(workersPath)
        .then(response => response.data as WorkerInfo[])
        .then(data => {
            dispatch({ type: 'RECEIVE_WORKERS_INFO', workersInfo: data });
            fetched = true;
        });

    addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
    dispatch({ type: 'REQUEST_WORKERS_INFO', force: false });
};

export const actionCreators = {
    requestWorkersInfo: (force: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        if (force || !fetched) {
            requestWorkers(dispatch)
        }
    },

    pingWorker: (workerId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        axios.post(pingWorkerPath.replace('{id}', workerId))
            .then(() => requestWorkers(dispatch));
    },

    addWorker: (workerId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        axios.post(addWorkerPath.replace('{id}', workerId))
            .then(() => requestWorkers(dispatch));
    },

    removeWorker: (workerId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        axios.delete(workerPath.replace('{id}', workerId))
            .then(() => requestWorkers(dispatch));
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: WorkersInfoState = { workersInfo: [], isLoading: false };

export const reducer: Reducer<WorkersInfoState> = (state: WorkersInfoState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'ADD_WORKER':
        case 'REMOVE_WORKER':
        case 'PING_WORKER':
        case 'REQUEST_WORKERS_INFO':
            return {
                workersInfo: state.workersInfo,
                isLoading: true
            };
        case 'RECEIVE_WORKERS_INFO':
            return {
                workersInfo: action.workersInfo,
                isLoading: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
