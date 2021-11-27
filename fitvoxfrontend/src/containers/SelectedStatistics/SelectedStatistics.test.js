import React from 'react';
import {mount} from 'enzyme';
import { Provider } from 'react-redux';
import {createStore} from 'redux';
import thunk from 'redux-thunk';
import { applyMiddleware } from 'redux';
import { Route, Switch, Router } from 'react-router-dom';
import SelectedStatistics from './SelectedStatistics';
import { createMemoryHistory } from 'history';
import * as actionCreators from '../../store/actions/exerciselistActions/exerciselistActions'

import {TextField} from "@mui/material"

let stubInitialState = {
    exercise: {
        exerciseList: [
            {
                "id": 0,
                "muscleType": "Neck",
                "exerciseType": "Neck Raise",
                "name": "Neck Raise",
                "hardness": "1;2;3;",
                "isFavorite": true,
                "tags": {
                    "tags": [
                        "#Neck_Raise",
                    ]
                },
                "oneRms": [
                    {
                        date: 20211126,
                        value: 120.0001
                    },
                    {
                        date: 20211125,
                        value: 130.0001
                    } 
                ],
                "volumes": [
                    {
                        date: 20211126,
                        value: 300
                    },
                    {
                        date: 20211125,
                        value: 240
                    }
                ]
            },
            {
                "id": 1,
                "muscleType": "Neck",
                "exerciseType": "Neck Raise",
                "name": "Neck Raise Side",
                "hardness": "1;2;3;",
                "isFavorite": true,
                "tags": {
                    "tags": [
                        "#Neck_Raise",
                        "#Side"
                    ]
                },
                "oneRms": [
                    {
                        date: 20211127,
                        value: 170
                    },
                    {
                        date: 20211125,
                        value: 170
                    },
                ],
                "volumes": [
                    {
                        date: 20211127,
                        value: 400
                    },
                    {
                        date: 20211125,
                        value: 420
                    },
                ]
            },
            {   
                "id": 2,
                "muscleType": "Trapezius",
                "exerciseType": "Y-Raise",
                "name": "Y-Raise: Dumbbell",
                "hardness": "2;3;",
                "isFavorite": false,
                "tags": {
                    "tags": [
                        "#Dumbbell",
                    ]
                }
            },
        ],
    }
}

const mockStore = createStore((state, action) => state,
                            stubInitialState,
                            applyMiddleware(thunk));

jest.mock('react-chartjs-2', () => ({
    Line: () => null,
}));

describe("Test <SelectedStatistics/>", () => {
    let selectedStats;

    beforeEach(() => {
        selectedStats = (
            <Provider store = {mockStore}>
                <Router history = {createMemoryHistory({ initialEntries: ['/exercise_list/stats/Neck=Neck Raise=Neck_Raise']})}>
                    <Route path = "/exercise_list/stats/:query" exact component = {SelectedStatistics}/>
                </Router>
            </Provider>
        )
    });

    it ('should render without error', () => {
        const component = mount(selectedStats)
        expect(component.find("#selected_stats").length).toBe(3)
        const instance = component.find(SelectedStatistics.WrappedComponent).instance()
        expect(instance.state.header).toBe("Neck & Neck Raise & #Neck_Raise")
        expect(instance.state.query).toEqual(['Neck', "Neck Raise", "#Neck_Raise"])
        expect(instance.state.num_exercise).toBe(2)
        expect(instance.state.target_exercise.length).toBe(2)
        expect(instance.state.colors.length).toBe(2)
        expect(instance.state.labels).toEqual([20211125, 20211126, 20211127])
        expect(instance.state.oneRM_datas).toEqual([["130.00", "120.00", NaN],["170.00", NaN, "170.00"]])
        expect(instance.state.volume_datas).toEqual([["240.00", "300.00", NaN],["420.00", NaN, "400.00"]])
        expect(instance.state.colors[0]).not.toBe(instance.state.colors[1])
    })

    it ('should filter without tags', () => {
        selectedStats = (
            <Provider store = {mockStore}>
                <Router history = {createMemoryHistory({ initialEntries: ['/exercise_list/stats/Neck=Neck Raise']})}>
                    <Route path = "/exercise_list/stats/:query" exact component = {SelectedStatistics}/>
                </Router>
            </Provider>
        )
        const component = mount(selectedStats)
        expect(component.find("#selected_stats").length).toBe(3)
        const instance = component.find(SelectedStatistics.WrappedComponent).instance()
        expect(instance.state.header).toBe("Neck & Neck Raise")
        expect(instance.state.query).toEqual(['Neck', "Neck Raise"])
        expect(instance.state.num_exercise).toBe(2)
        expect(instance.state.target_exercise.length).toBe(2)
    })

    it ('should not filter any exercises for some tags', () => {
        selectedStats = (
            <Provider store = {mockStore}>
                <Router history = {createMemoryHistory({ initialEntries: ['/exercise_list/stats/Neck=Neck Raise=ASDF']})}>
                    <Route path = "/exercise_list/stats/:query" exact component = {SelectedStatistics}/>
                </Router>
            </Provider>
        )
        const component = mount(selectedStats)
        expect(component.find("#selected_stats").length).toBe(3)
        const instance = component.find(SelectedStatistics.WrappedComponent).instance()
        expect(instance.state.num_exercise).toBe(0)
        expect(instance.state.target_exercise.length).toBe(0)
    })

    it('should change chart type properly', () => {
        const component = mount(selectedStats);
        const instance = component.find(SelectedStatistics.WrappedComponent).instance()
        const volume_button = component.find('#volume').at(0)
        volume_button.simulate('click')
        expect(instance.state.chartType).toBe("volume")
        component.find('#volume').at(0).simulate('click')
        expect(instance.state.chartType).toBe("volume")
        const one_rm_button = component.find("#one_rm").at(0);
        one_rm_button.simulate('click')
        expect(instance.state.chartType).toBe('one_rm')
        component.find('#one_rm').at(0).simulate('click')
        expect(instance.state.chartType).toBe("one_rm")
    })
})