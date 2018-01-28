import { lazyInitialization, System, vec4 } from 'oxygen-core';
import AntenaController from './AntenaController';

lazyInitialization({
  render: { screen: 'screen-0' },
  store: { id: 'oxygen-core' }
});

const {
  AssetSystem,
  RenderSystem,
  EntitySystem
} = System.systems;

EntitySystem.registerComponent('AntenaController', AntenaController.factory);

vec4.set(RenderSystem.clearColor, 182/255, 182/255, 183/255, 1);

AssetSystem.load('pack://assets.pack')
  .then(packAsset => AssetSystem.fetchEngine = packAsset.makeFetchEngine())
  .then(() => AssetSystem.load('json://config.json'))
  .then(configAsset => AssetSystem.loadAll(configAsset.data.assets))
  .then(() => System.events.triggerLater(
    'change-scene',
    'scene://scenes/game.json'
  ));
