type Match<On, Out> = [On] extends [never]
	? {
			yield(): Out;
	  }
	: {
			case<Sub extends On, Opt>(
				predicate: (value: On) => value is Sub,
				yields: (value: Sub) => Opt
			): Match<Exclude<On, Sub>, Out | Opt>;
			case<Opt>(predicate: (value: On) => true, yields: (value: On) => Opt): Match<never, Out | Opt>;
			case<Opt>(predicate: (value: On) => boolean, yields: (value: On) => Opt): Match<On, Out | Opt>;
			default<Opt>(yields: (value: On) => Opt): Out | Opt;
			yield(): void;
	  };

const match = <T>(value: T): Match<T, never> => matchImpl(value, []);
const matchImpl = (value: any, cases: any[]): any => ({
	case: (predicate: any, callback: any) => (matchImpl as any)(value, [...cases, {predicate, callback}]),
	default: (callback: any) => (matchImpl as any)(value, [...cases, {predicate: () => true, callback}]).yield(),
	yield: () => cases.find(({predicate}) => predicate(value))?.callback(value),
});

export {match};
