import { floor, isUndefined, slice, concat, assign, isEqual } from 'lodash-es';
import { spreads } from './jirachi-spreads';
import { calcChksum, getBlockNum, getBlocks } from './gba-save';

function isJirachiSeed(block0) {
  const chk = calcChksum(block0);
  
  if (isUndefined(spreads[chk])) {
    return 0;
  }

  return chk;
}

function bytesToSeconds([ hoursl, hoursh, minutes, seconds ]) {
  const hours = (hoursh * 0x100) + hoursl;
  return (hours * 3600) + (minutes * 60) + seconds;
}

function secondsToBytes(time) {
  const seconds = time % 60;
  const minutes = floor(time / 60) % 60;
  const hours = floor(time / 3600) % 60;
  const hoursl = hours & 0xFF;
  const hoursh = hours >>> 8;

  return [ hoursl, hoursh, minutes, seconds ];
}

function increaseTime(bytes) {
  return secondsToBytes(bytesToSeconds(bytes) + 1);
}

function timeToString(time) {
  const [ hoursl, hoursh, minutes, seconds, frames ] = time;
  const hours = (hoursh * 0x100) + hoursl;

  return `Hours: ${hours}, Min: ${minutes}, Sec: ${seconds}, Frames: ${frames}`;
}

function findShinyJirachiTime(save, searchHours = 1) {
  const blocks = getBlocks(save);
  const block0 = getBlockNum(blocks, 0);
  const block0_1 = slice(block0, 0, 14);
  const block0_2 = slice(block0, 18);
  let time = slice(block0, 14, 18);

  for (let i = 0; i < 3600 * searchHours; i++) {
    const shinySeed = isJirachiSeed(concat(block0_1, time, block0_2));

    if (!isEqual(shinySeed, 0)) {
      return {
        seed: assign({}, spreads[shinySeed], { shinySeed }),
        time: timeToString(concat(time, [ block0[18] ]))
      };
    }

    time = increaseTime(time);
  }

  return {};
}

export { findShinyJirachiTime };