import Vuex, { Store } from 'vuex';
import Vue, { ComponentOptions } from 'vue';


Vue.use(Vuex);

export class RootState {

}

export const store: Store<RootState> = new Vuex.Store<RootState>({
    modules: {}
});