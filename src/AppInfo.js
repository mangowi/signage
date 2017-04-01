import React from 'react';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import { FirebaseRef } from './FirebaseClient';

export default class AppInfoList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      apps: []
    };
  }

  componentDidMount() {
    this.bindAsArray(FirebaseRef.child('apps'), 'apps');
  }

  renderItem(app) {
    return <li key={app['.key']}>{app.name}: <a href="{app.url}" target="_"><code>{app.url}</code></a></li>
  }

  render() {
    return (
      <div>
        <h2>Applications</h2>
        <ul>
          {this.state.apps.map(this.renderItem)}
        </ul>
      </div>
    )
  }
}

reactMixin(AppInfoList.prototype, ReactFireMixin);
