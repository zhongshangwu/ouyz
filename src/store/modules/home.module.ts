import { ActionTree, MutationTree, Module } from 'vuex';
import { PostLists } from '@/models/posts.class';
import { RootState } from '@/store';
import { Fetch_Home_Posts_List, Set_Home_Posts_List } from '@/store/types';
import { fetchPostsList } from '@/api';


export class HomeState {
  postLists = new PostLists();
  page = 0;
}

const state = (): HomeState => ({
  postLists: new PostLists(),
  page: 0
});


const actions: ActionTree<HomeState, RootState> = {
  async [ Fetch_Home_Posts_List ]({ commit }, { page }: { page: number }) {
    const data = await fetchPostsList(page);
    commit(Set_Home_Posts_List, { data, page });
  }
};


const mutations: MutationTree<HomeState> = {
  [ Set_Home_Posts_List ](state, { data, page }) {
    state.postLists = new PostLists(data);
    state.page = page;
  }
};

const getter = {};

export class HomeModule implements Module<HomeState, RootState> {
  namespaced = true;
  state = state;
  actions = actions;
  mutations = mutations;
  getters = getter;
}