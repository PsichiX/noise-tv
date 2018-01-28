import { Script, System } from 'oxygen-core';

const DELAY = 3;
const TRESHOLD = 0.15;
const GOAL = 30;
const TIMER = 60;

export default class AntenaController extends Script {

  static factory() {
    return new AntenaController();
  }

  get timer() {
    return this._timer;
  }

  get goal() {
    return this._goal;
  }

  get running() {
    return this._running;
  }

  constructor() {
    super();

    this._target = 0;
    this._input = null;
    this._accum = 0;
    this._goal = 0;
    this._running = false;
    this._timer = 0;
  }

  dispose() {
    super.dispose();

    this._input = null;
  }

  pickTarget() {
    this._target = Math.random();
    this._accum = 0;
  }

  onAttach() {
    super.onAttach();

    const { AssetSystem } = System.systems;
    this._input = this.entity.getComponent('InputHandler');
    this._input.setup(AssetSystem.get('json://config.json').data.input);

    this.pickTarget();
    this._accum = 0;
    this._goal = 0;
    this._running = true;
    this._timer = TIMER;
  }

  onUpdate(deltaTime) {
    if (!this._input || !this._running) {
      return;
    }

    const { entity } = this;
    deltaTime *= 0.001;
    const level = (this._input.getAxis('level') + 1) * 0.5;
    entity.setRotation((level * 2 - 1) * 15 * Math.PI / 180);

    const diff = Math.abs(this._target - level);
    if (diff < TRESHOLD) {
      this._goal += deltaTime;
    }

    if (this._accum >= DELAY) {
      this.pickTarget();
    } else {
      this._accum += deltaTime;
    }

    const g = 1 + (this._timer | 0);
    const tmp = g < 10 ? `0${g}` : `${g}`;
    entity
      .findEntity('/timer/goal')
      .getComponent('TextRenderer')
      .text = `00:${tmp}`;
    entity
      .findEntity('/tv')
      .getComponent('Sprite')
      .overrideBaseTexture = diff < TRESHOLD
        ? 'images/tv.png'
        : 'images/no_signal.png';
    entity
      .findEntity('/guys')
      .getComponent('Sprite')
      .overrideBaseTexture = diff < TRESHOLD
        ? 'images/happy.png'
        : 'images/angry.png';
    entity
      .findEntity('/timer/progress')
      .setScale(Math.max(0, Math.min(this._goal / GOAL)), 1);

    if (this._goal >= GOAL) {
      entity.findEntity('/you-won').active = true;
      this._running = false;
    }
    if (this._timer <= 0) {
      entity.findEntity('/game-over').active = true;
      this._running = false;
    }
    this._timer -= deltaTime;
  }

}
