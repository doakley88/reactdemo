import React, { Component } from 'react';
import {Button, ButtonGroup, Container, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { Link } from 'react-router-dom';

class ImageList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			images: [],
			selectedFile: null, 
			isLoading: true,
			showUpload: false,
		};
		this.toggleUpload = this.toggleUpload.bind(this);
		this.uploadFile = this.uploadFile.bind(this);
		this.onFileChange = this.onFileChange.bind(this);
	}

	toggleUpload() {
		this.setState({showUpload: !this.state.showUpload})
	}

	onFileChange = event => {
		this.setState({selectedFile: event.target.files[0]})
	}

	componentDidMount() {
		this.setState({isLoading:true});

		fetch('/list')
			.then(response => response.json())
			.then(data => this.setState({images: data, isLoading: false}));
	}

	async remove(filename) {
		await fetch(`/delete/${filename}`, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}).then(() => {
			let updatedImages = [...this.state.images].filter(i => i.name !== filename);
			this.setState({images: updatedImages});
		})
	}

	uploadFile() {
		const file = this.state.selectedFile
		const fileName = this.state.selectedFile.name;
		if(file && fileName) {

			console.log("uploading " + file);

			const formData = new FormData();
			formData.append("file", file, fileName);
			fetch('/uploadFile', {
				method: 'POST',
				body: formData,
			})
				.then(response =>response.json())
				.then((success) => {
					console.log("filename " + success.fileName)
					console.log("uri " + success.fileDownloadUri)
					const file = {
						name: success.fileName,
						downloadUri: success.fileDownloadUri
					}
					this.setState({
						images:this.state.images.concat(file),
						selectedFile:null,
					})
				})
				.catch(error => console.log(error)
			);
			this.toggleUpload();
 
		} else {
			console.log('empty file bruh');
			this.setState({showUpload:false});
		}
	}

	render() {
		const {images, isLoading} = this.state;

		if(isLoading) {
			return <p>Loading . . .</p>
		}

		const imageList = images.map(image => {
			const name = `${image.name}`;
			const downloadUri = `${image.downloadUri}`;
			return <tr key={image.name}>
				<td style={{whiteSpace: 'nowrap'}}>{name}</td>
				<td>
					<img width="400" src={downloadUri}/>
				</td>
				<td>
					<ButtonGroup>
						<Button size="sm" color="primary" onClick={() => this.remove(image.name)}>
							Make template
						</Button>
						<Button size="sm" color="secondary" onClick={() => this.remove(image.name)}>
							Make mapper
						</Button>
						<Button size="sm" color="danger" onClick={() => this.remove(image.name)}>
							Delete
						</Button>
					</ButtonGroup>
				</td>
			</tr>
		});

		return (
			<div>
				<Container fluid>
					<div className="float-right">
						<Button color="success" onClick={this.toggleUpload}>Upload image</Button>
						<Modal isOpen={this.state.showUpload} toggle={this.toggleUpload}>
							<ModalHeader toggle={this.toggleUpload}>Modal title</ModalHeader>
							<ModalBody>
								<input type="file" name="file" onChange={this.onFileChange} />
							</ModalBody>
							<ModalFooter>
								<Button color="primary" onClick={this.uploadFile}>Upload</Button>{ ' '} 
								<Button color="secondary" onClick={this.toggleUpload}> Cancel</Button>
							</ModalFooter>
						</Modal>
					</div>
					<h3>Some Image Shit</h3>
					<Table className="mt-4">
						<thead>
							<tr>
								<th width="10%">Name</th>
								<th>Image</th>
								<th width="10%">Actions</th>
							</tr>
						</thead>
						<tbody>
							{imageList}
						</tbody>
					</Table>
				</Container>
			</div>
		);
	}
}

export default ImageList;