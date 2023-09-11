<template>
	<div class="container" :title="title">
		<label :class="classObj">
			<div class="label" :class="classObj">{{ name }}</div>
			<input v-if="type === 'checkbox'"
				:id="id"
				type="checkbox"
				:name="id"
				checked />
			<span v-if="type === 'checkbox'" class="slider round" />
			<select v-else-if="type === 'select'" :id="id" :name="id">
				<slot />
			</select>
		</label>
	</div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

const classObj = computed(() => ({
	switch: props.type === 'checkbox',
	select: props.type === 'select',
}));
</script>

<style scoped>
.container {
	height: 17px;
	width: 98%;
	padding-bottom: 6px;
	padding-top: 6px;
	padding-left: 4px;
	background-color: #f1f1f1;
}

.container:hover {
	background-color: #dfdfdf;
}

.switch {
	position: relative;
	display: inline-block;
	width: 30px;
	height: 17px;
	cursor: pointer;
}

.switch input {
	display: none;
}

.slider {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ccc;
	-webkit-transition: .2s;
	transition: .2s;
	border-radius: 17px;
}

.slider:before {
	position: absolute;
	content: "";
	height: 13px;
	width: 13px;
	left: 2px;
	bottom: 2px;
	background-color: white;
	-webkit-transition: .2s;
	transition: .2s;
	border-radius: 50%;
}

input:checked+.slider {
	background-color: #2196F3;
}

input:focus+.slider {
	box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
	-webkit-transform: translateX(13px);
	-ms-transform: translateX(13px);
	transform: translateX(13px);
}

.label {
	padding-left: 40px;
	width: 150px;
	font-family: sans-serif;
	font-size: 12px;
}

label.select {
	display: flex;
	flex-direction: row-reverse;
	white-space: nowrap;
	align-items: center;
	justify-content: center;
}

.label.select {
	padding-left: 5px;
}

select {
	background: transparent;
	color: #000;
	font-size: 12px;
	padding: 0;
}
</style>
