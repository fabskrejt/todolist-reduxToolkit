import {Dispatch} from 'redux'
import {authAPI} from '../api/todolists-api'
import {setIsLoggedInAC} from '../features/Login/auth-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

const initialState = {
    status: 'idle',
    error: null as null | string,
    isInitialized: false
}

const slice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setAppErrorAC: (state, action: PayloadAction<{ value: string | null }>) => {
            state.error = action.payload.value
        },
        setAppStatusAC: (state, action: PayloadAction<{ value: RequestStatusType }>) => {
            state.status = action.payload.value
        },
        setAppInitializedAC: (state, action: PayloadAction<{ value: boolean }>) => {
            state.isInitialized = action.payload.value
        },
    },
})
export const {setAppInitializedAC, setAppStatusAC, setAppErrorAC} = slice.actions
export const appReducer = slice.reducer

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

export const initializeAppTC = () => (dispatch: Dispatch) => {
    authAPI.me().then(res => {
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedInAC({value: true}));
        } else {
        }
        dispatch(setAppInitializedAC({value: true}));
    })
}
