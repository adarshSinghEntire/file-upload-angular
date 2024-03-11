import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUploadService } from '../service/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  form!: FormGroup;

  files: File[] = [];
  maxTotalFileSize = 2000000; // 2 MB in bytes
  totalFileSize = 0;

  isMaxFileSize: boolean = false;
  // isMaxFileSize:boolean = false;
  public fileType: any;

  constructor(private fb: FormBuilder,private fileUploadService: FileUploadService) {
    this.form = this.fb.group({
      files: [[], [Validators.required]]
    });
    this.fileType = ".pdf, .jpg, .png, .jpeg, .gif, .zip, .rar"
  }

  get fval() { return this.form.controls; }
  isInvalidType:boolean = false;

  arrUpload:any = [];
  onFileChange(event: any): void {
    const selectedFiles: FileList = event.target.files;
   

    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        const list = file.name.split('.');
        const fileType = list[list.length - 1];
        if (!this.fileType?.includes(fileType.toLowerCase())) {
          this.isInvalidType = true;
          setTimeout(() => {
          this.isInvalidType = false;
          }, 3000);
          return;
        }

        if (!this.isDuplicate(file) && file.size <= this.maxTotalFileSize) {
          this.totalFileSize += file.size;

          if (this.totalFileSize <= this.maxTotalFileSize) {
            this.files.push(file);
            this.arrUpload.push({
              file: file
            });
          }
          else {
            this.isMaxFileSize = true;
            setTimeout(() => {
              this.isMaxFileSize = false;
            }, 3000);
          }
        } else if (this.isDuplicate(file)) {
          console.warn(`File "${file.name}" is a duplicate and will be skipped.`);
        } else {
          this.isMaxFileSize = true;
          setTimeout(() => {
            this.isMaxFileSize = false;
          }, 3000);
          console.warn(`File "${file.name}" exceeds the maximum size of 2 MB and will be skipped.`);
        }
      }
      console.log(this.totalFileSize, 'totalFileSize');

    }

    this.form.get('files')?.setValue(this.files);
  }

  isDuplicate(file: File): boolean {
    return this.files.some(existingFile => existingFile.name === file.name && existingFile.size === file.size);
  }

  formatBytes(bytes: number): string {
    const UNITS = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const factor = 1024;
    let index = 0;

    while (bytes >= factor) {
      bytes /= factor;
      index++;
    }
    return `${parseFloat(bytes.toFixed(2))} ${UNITS[index]}`;
  }
  onFileRemoved(index: number): void {
    this.totalFileSize -= this.files[index].size;
    console.log(this.totalFileSize);

    this.files.splice(index, 1);
    // this.files.forEach((file:any)=>{
    //   this.totalFileSize += file.size;
    // })
    this.form.get('files')?.setValue(this.files);
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Perform file upload actions
      console.log('Files uploaded successfully:', this.files);
      this.arrUpload?.forEach((element:any) => {
        this.upload(element.file);
       });

    } else {
      console.error('Form is invalid. Please check your files.');
    }
  }

  resDataArr:any = [];
  upload(file:any){
    if (file) {
      console.log(file);
      this.fileUploadService.upload(file).subscribe((event: any) => {
        console.log();
        this.resDataArr.push(event)
        if (typeof event === 'object') {
          // Short link via api response
        }
      });
    }

    
  }
}
