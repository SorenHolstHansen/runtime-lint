// A batch loader using a dataloader pattern
class Loader<T> {
	constructor(
		private debounceMs: number,
		private batchLoaderCb: (entries: T[]) => void,
		private batchLoaderHasBeenCalled = false,
		private entries: T[] = [],
	) {}

	load(entry: T) {
		return new Promise((resolve) => {
			this.entries.push(entry);
			setTimeout(() => {
				if (!this.batchLoaderHasBeenCalled) {
					this.batchLoaderCb(this.entries);
					this.batchLoaderHasBeenCalled = true;
				}

				resolve(null);
			}, this.debounceMs);
		});
	}
}
