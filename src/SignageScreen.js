import React, { Component } from 'react';
import ReactFireMixin from 'reactfire';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import { FirebaseRef } from './firebase';

export default class SignageScreen extends Component {
  state = {
    apps: [],
    config: {},
    playlist: {},
    sequence: [],
    currentFrame: null,
    nextFrame: null,
  };

  nextIndex = 0;
  endFrameTime = 0;

  componentDidMount() {
    this.bindAsArray(FirebaseRef.child('apps'), 'apps');
    this.bindAsObject(FirebaseRef.child('config'), 'config');
    this.bindAsObject(FirebaseRef.child('playlist'), 'playlist');
    this.bindAsArray(FirebaseRef.child('playlist/sequence'), 'sequence');
    this.setInterval(this.tick, 1000);
  }

  tick = () => {
    const { apps, sequence } = this.state;
    if (!apps.length || !sequence.length) return;
    if (new Date().getTime() >= this.endFrameTime) {
      this.advanceFrame();
    }
  }

  advanceFrame() {
    const { playlist, sequence } = this.state;
    const playlistIndex = this.nextIndex;
    this.nextIndex = (1 + playlistIndex) % sequence.length;
    const currentFrame = sequence[playlistIndex];
    const nextFrame = sequence[this.nextIndex];
    if (!currentFrame) return;

    const duration = currentFrame.duration || playlist.duration || 60;
    this.endFrameTime = new Date().getTime() + duration * 1000;
    console.info(`waiting ${duration} seconds`);
    this.setState({currentFrame, nextFrame});
  }

  renderApp = (frame) => {
    const { config } = this.state;
    const app = this.state.apps[frame.app];
    const height = config.screen.height || '800px';
    const width = config.screen.width || '100%';
    const style = {position: 'relative', height, width};
    return this.props.dummy ? (
      <AppPagePlaceholder app={app} frame={frame} style={style} />
    ) : app ? (
      <iframe src={app.url} scrolling="no" frameBorder="0" style={style} />
    ) : (
      <div className="alert alert-danger">Missing app: {frame.app}</div>
    );
  }

  render() {
    const { currentFrame, nextFrame, config } = this.state;

    if (!currentFrame) {
      return <div className="alert alert-info">Loading…</div>;
    }

    if (!config.screen) {
      return <div className="alert alert-danger">Missing configuration</div>;
    }

    return this.renderApp(currentFrame);
  }
}
reactMixin(SignageScreen.prototype, ReactFireMixin);
reactMixin(SignageScreen.prototype, TimerMixin);

// from http://stackoverflow.com/a/15710692/220667
const hashCode = (str) =>
  [].reduce.call(str, (p, c, i, a) => (p << 5) - p + a.charCodeAt(i), 0);

function AppPagePlaceholder({app, frame, style}) {
  const h = hashCode(app.url);
  const r0 = (h >> 16) & 0xff, g0 = (h >> 8) & 0xff, b0 = h & 0xff;
  const r = 0x80 + Math.floor(r0 / 2), g = 0x80 + Math.floor(g0 / 2), b = 0x80 + Math.floor(b0 / 2);
  const background = `rgb(${r}, ${g}, ${b})`;
  const style1 = {...style, ...{background}};
  return (<div className="app-placeholder alert" style={style1}>
    <h1>
      {app.name}
      {frame.duration && <small> ({frame.duration} seconds)</small>}
    </h1>
    <div><tt>{app.url}</tt></div>
  </div>);
}
