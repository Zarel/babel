const log = [];

async function* inner() {
  log.push(1);
  yield "a";
  log.push(2);
  yield "b";
  log.push(3);
}

async function* outer() {
  log.push(4);
  yield* inner();
  log.push(5);
}

return (async () => {
  const iterator = outer();

  let res = await iterator.next();
  expect(res).toEqual({ value: "a", done: false });
  expect(log).toEqual([4, 1]);

  res = await iterator.return();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([4, 1]);

  res = await iterator.next();
  expect(res).toEqual({ value: undefined, done: true });
  expect(log).toEqual([4, 1]);
})();
