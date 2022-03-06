import {setAppErrorAC, setAppStatusAC} from '../app/app-reducer'
import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(setAppErrorAC({value: data.messages[0]}))
    } else {
        dispatch(setAppErrorAC({value: 'Some error occurred'}))
    }
    dispatch(setAppStatusAC({value: 'failed'}))
}

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
    dispatch(setAppErrorAC({value: error.message ? error.message : 'Some error occurred'}))
    dispatch(setAppStatusAC({value: 'failed'}))
}
