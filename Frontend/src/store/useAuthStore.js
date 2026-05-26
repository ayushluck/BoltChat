import {create} from 'zustand';

export const useAuthStore = create((set,get) => ({
    authUser: {name:"john",_id:123,age:25},
    isLoading: false,
    login: () => {
        console.log("Login function called");
        set({ isLoading: true });
    }   
}));
