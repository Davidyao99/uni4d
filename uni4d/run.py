import configargparse
import os
import torch

from engine import Engine

def parse_args(input_string=None):

    parser = configargparse.ArgParser()

    parser.add_argument('--config', is_config_file=True, default="./config/config_static.yaml", help='config file path')
    parser.add_argument('--gpu', type=str, default='0', help='gpu')
    parser.add_argument('--workdir', type=str, default='workdir', help='workdir')
    parser.add_argument('--intrinsics_lr', type=float, default=1e-3, help='intrinsics learning rate')
    parser.add_argument('--cp_translation_dyn_lr', type=float, default=1e-3, help='dyn points translation learning rate')
    parser.add_argument('--uncertainty_lr', type=float, default=1e-4, help='uncertainty learning rate')
    parser.add_argument('--ba_lr', type=float, default=1e-2, help='bundle adjustment learning rate')
    parser.add_argument('--device', type=str, default='cuda', help='device')
    parser.add_argument('--num_init_epochs', type=int, default=100, help='number of init epochs')
    parser.add_argument('--num_BA_epochs', type=int, default=100, help='number of BA epochs')
    parser.add_argument('--num_dyn_epochs', type=int, default=100, help='number of dyn epochs')
    parser.add_argument('--experiment_name', type=str, help='experiment name')
    parser.add_argument('--reproj_weight', type=float, help='weight for reproj error')
    parser.add_argument('--pose_smooth_weight_t', type=float, help='weight for pose smoothness for t')
    parser.add_argument('--pose_smooth_weight_r', type=float, help='weight for pose smoothness for R')
    parser.add_argument('--dyn_smooth_weight_t', type=float, help='dyn smoothness weight')
    parser.add_argument('--dyn_laplacian_weight_t', type=float, help='dyn laplacian weight')
    parser.add_argument('--log', action='store_true', default=False, help='log to file or print to console')
    parser.add_argument('--opt_intrinsics', action='store_true', default=False, help='optimize intrinsics')
    parser.add_argument('--vis_4d', action='store_true', default=False, help='vis 4d')
    parser.add_argument('--depth_dir', type=str, default="unidepth", help='dir where predicted depth is stored')
    parser.add_argument('--cotracker_path', type=str, default="cotracker", help='cotracker type')
    parser.add_argument('--dyn_mask_dir', type=str, help='dir where dynamic mask is stored')
    parser.add_argument('--video', type=str, help='winit_optimizhich video to work on')
    parser.add_argument('--loss_fn', type=str, help='which loss function to use')
    parser.add_argument('--print_every', type=int, default=20, help='print every')
    parser.add_argument('--deterministic', action='store_true', help='whether to use deterministic mode for consistent results')
    parser.add_argument('--seed', type=int, default=42, help='seed num')
    
    if input_string is not None:
        opt = parser.parse_args(input_string)
    else:
        opt = parser.parse_args()

    return opt

def train_from_opt(opt):

    engine = Engine(opt)
    engine.initialize()

    engine.optimize_init()
    engine.log_timer("init")

    engine.optimize_BA()
    engine.reinitialize_static()             # add more static points
    engine.log_timer("BA")

    if engine.num_points_dyn > 0:
        engine.init_dyn_cp()
        engine.optimize_dyn()
        engine.filter_dyn()
        engine.log_timer("dyn")    

    engine.save_results(save_fused_points=opt.vis_4d)

    del engine

def main():
    opt = parse_args()

    os.environ['CUDA_VISIBLE_DEVICES'] = opt.gpu
    os.environ['NUMEXPR_MAX_THREADS'] = '32'

    if opt.video == "None":

        videos = sorted(os.listdir(f"{opt.workdir}"))

        for i, video in enumerate(videos):

            print(f"Working on {video}", flush=True)

            opt.video_name = video
            
            train_from_opt(opt)

            torch.cuda.empty_cache()

    else:

        print(f"Working on {opt.video}", flush=True)

        opt.video_name = opt.video
        
        train_from_opt(opt)

        torch.cuda.empty_cache()

if __name__ == '__main__':
    main()