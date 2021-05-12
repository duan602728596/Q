import Pipe from '../src/Pipe';

test('Pipe test', async function() {
  const initialState = {
    a: 14,
    b: 32
  };

  function add(state, callback) {
    state.result = state.a + state.b;
    callback();
  }

  function less(state, callback) {
    state.result -= 3;
    callback();
  }

  function end(state) {
    state.result = String(state.result);
  }

  function project() {
    return Pipe(initialState)
      .pipe(add)
      .pipe(less)
      .dest(end);
  }

  await project();
  expect(initialState).toEqual({
    a: 14,
    b: 32,
    result: '43'
  });
});