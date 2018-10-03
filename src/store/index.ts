import Vuex, { Store } from 'vuex';
import Vue, { ComponentOptions } from 'vue';

import { HomeModule, HomeState } from '@/store/modules/home.module';


Vue.use(Vuex);

export class RootState {

    home = new HomeState();

}

export const store: Store<RootState> = new Vuex.Store<RootState>({
    modules: {
        home: new HomeModule(),
    }
});