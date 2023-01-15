interface Match<On, Out> {
	case<Sub extends On, Opt>(
		predicate: (value: On) => value is Sub,
		yields: (value: Sub) => Opt
	): Match<On, Out | Opt>;
	case<Opt>(predicate: (value: On) => true, yields: (value: On) => Opt): Yield<Opt>;
	case<Opt>(predicate: (value: On) => boolean, yields: (value: On) => Opt): Match<On, Out | Opt>;
	default<Opt>(yields: () => Opt): Yield<Out | Opt>;
}

interface Yield<T> {
	yield(): T;
}

function match<T>(value: T): Match<T, never>;
function match(value) {
	const callbacks = [];
	const instance = {
		case: (predicate, callback) => {
			callbacks.push({predicate, callback});
			return instance;
		},
		default: (callback) => {
			callbacks.push({predicate: () => true, callback});
			return instance;
		},
		yield: () => callbacks.find(({predicate}) => predicate(value)).callback(value),
	};
	return instance;
}

export {match};
