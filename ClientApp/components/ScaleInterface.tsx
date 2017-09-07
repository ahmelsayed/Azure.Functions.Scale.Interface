import * as React from 'react';
import * as ReactDataGrid from 'react-data-grid';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as WorkersInfoState from '../store/WorkersInfo';
import { WorkerContextMenu } from './WorkerContextMenu';
import { Column } from 'react-data-grid';

// At runtime, Redux will merge together...
type WorkerInfoProps =
    WorkersInfoState.WorkersInfoState        // ... state we've requested from the Redux store
    & typeof WorkersInfoState.actionCreators      // ... plus action creators we've requested
    & RouteComponentProps<{}>; // ... plus incoming routing parameters

class ScaleInterface extends React.Component<WorkerInfoProps, {}> {
    componentWillMount() {
        this.props.requestWorkersInfo(false);
    }

    componentWillReceiveProps(nextProps: WorkerInfoProps) {
        this.props.requestWorkersInfo(false);
    }


    private getColumns(): Column[] {
        return [
            {
                key: 'id',
                name: 'Worker Id'
            },
            {
                key: 'stampName',
                name: 'StampName',
            }, {
                key: 'workerName',
                name: 'Worker Name',
            }, {
                key: 'loadFactor',
                name: 'Load Factor',
            }, {
                key: 'lastModifiedTimeUtc',
                name: 'Last Modified Time Utc',
            }, {
                key: 'isManager',
                name: 'Is Manager',
            }, {
                key: 'isStale',
                name: 'Is Stale',
            }
        ];
    }

    private isManager(row: number | undefined) {
        return !!row && !!this.props.workersInfo[row] && this.props.workersInfo[row].isManager === 'true';
    }

    public render() {
        const spinner = this.props.isLoading
            ? <div> Loading... </div>
            : <div />
        return (
            <div>
                <div className="grid-header">
                    <h2>Workers Scale View</h2>
                    <div id="spinner">
                        {spinner}
                    </div>
                </div>
                <div className="grid-container">
                    <ReactDataGrid
                        contextMenu={<WorkerContextMenu
                            onWorkerAdd={(e, w) => this.props.addWorker(this.props.workersInfo[w.rowIdx].id)}
                            onWorkerRemove={(e, w) => this.props.removeWorker(this.props.workersInfo[w.rowIdx].id)}
                            onWorkerPing={(e, w) => this.props.pingWorker(this.props.workersInfo[w.rowIdx].id)}
                            isManager={row => this.isManager(row)}
                        />}
                        columns={this.getColumns()}
                        rowGetter={row => this.props.workersInfo[row]}
                        rowsCount={this.props.workersInfo.length}
                        rowHeight={50}
                    />
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.workersInfo, // Selects which state properties are merged into the component's props
    WorkersInfoState.actionCreators                 // Selects which action creators are merged into the component's props
)(ScaleInterface) as typeof ScaleInterface;
